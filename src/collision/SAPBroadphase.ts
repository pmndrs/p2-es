import type { AABB } from '../collision/AABB'
import type { Body } from '../objects/Body'
import { appendArray } from '../utils/Utils'
import type { AddBodyEvent, RemoveBodyEvent, World } from '../world/World'
import { Broadphase } from './Broadphase'

/**
 * Sweep and prune broadphase along one axis.
 */
export class SAPBroadphase extends Broadphase {
    /**
     * List of bodies currently in the broadphase.
     */
    axisList: Body[] = []
    axisIndex = 0

    private addBodyHandler: (e: AddBodyEvent) => void
    private removeBodyHandler: (e: RemoveBodyEvent) => void

    constructor() {
        super(Broadphase.SAP)

        this.addBodyHandler = (e) => {
            this.axisList.push(e.body)
        }

        this.removeBodyHandler = (e) => {
            // Remove from list
            const idx = this.axisList.indexOf(e.body)
            if (idx !== -1) {
                this.axisList.splice(idx, 1)
            }
        }
    }

    /**
     * Change the world
     * @param world
     */
    setWorld(world: World): void {
        // Clear the old axis array
        this.axisList.length = 0

        // Add all bodies from the new world
        appendArray(this.axisList, world.bodies)

        // Remove old handlers, if any
        world.off('addBody', this.addBodyHandler).off('removeBody', this.removeBodyHandler)

        // Add handlers to update the list of bodies.
        world.on('addBody', this.addBodyHandler).on('removeBody', this.removeBodyHandler)

        this.world = world
    }

    sortList(): void {
        const bodies = this.axisList
        const axisIndex = this.axisIndex

        // Sort the lists
        sortAxisList(bodies, axisIndex)
    }

    /**
     * Get the colliding pairs
     */
    getCollisionPairs(_world: World): Body[] {
        const bodies = this.axisList
        const result = this.result
        const axisIndex = this.axisIndex

        result.length = 0

        // Update all AABBs if needed
        let l = bodies.length
        while (l--) {
            const b = bodies[l]
            if (b.aabbNeedsUpdate) {
                b.updateAABB()
            }
        }

        // Sort the lists
        this.sortList()

        // Look through the X list
        for (let i = 0, N = bodies.length | 0; i !== N; i++) {
            const bi = bodies[i]

            for (let j = i + 1; j < N; j++) {
                const bj = bodies[j]

                // Bounds overlap?
                const overlaps = bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]
                if (!overlaps) {
                    break
                }

                if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
                    result.push(bi, bj)
                }
            }
        }

        return result
    }

    /**
     * Returns all the bodies within an AABB.
     * @param world
     * @param aabb
     * @param result An array to store resulting bodies in.
     * @return
     * @todo since the list is sorted, optimization can be done
     */
    aabbQuery(world: World, aabb: AABB, result: Body[] = []): Body[] {
        this.sortList()

        const axisList = this.axisList
        for (let i = 0; i < axisList.length; i++) {
            const b = axisList[i]

            if (b.aabbNeedsUpdate) {
                b.updateAABB()
            }

            if (b.aabb.overlaps(aabb)) {
                result.push(b)
            }
        }

        return result
    }
}

function sortAxisList(a: Body[], axisIndex: number) {
    axisIndex = axisIndex | 0
    for (let i = 1, l = a.length; i < l; i++) {
        const v = a[i]

        let j: number
        for (j = i - 1; j >= 0; j--) {
            if (a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]) {
                break
            }
            a[j + 1] = a[j]
        }

        a[j + 1] = v
    }
    return a
}
