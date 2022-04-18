import type { AABB } from '../collision/AABB'
import type { Body } from '../objects/Body'
import type { World } from '../world/World'
import { Broadphase } from './Broadphase'

/**
 * Naive broadphase implementation. Does N^2 tests.
 */
export class NaiveBroadphase extends Broadphase {
    constructor() {
        super(Broadphase.NAIVE)
    }

    /**
     * Get the colliding pairs
     * @param world
     * @return
     */
    getCollisionPairs(world: World) {
        const bodies = world.bodies
        const result = this.result

        result.length = 0

        for (let i = 0, Ncolliding = bodies.length; i !== Ncolliding; i++) {
            const bi = bodies[i]

            for (let j = 0; j < i; j++) {
                const bj = bodies[j]

                if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
                    result.push(bi, bj)
                }
            }
        }

        return result
    }

    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param world
     * @param aabb
     * @param result An array to store resulting bodies in.
     */
    aabbQuery(world: World, aabb: AABB, result: Body[] = []) {
        const bodies = world.bodies
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i]

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
