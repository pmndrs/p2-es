import type { AABB } from '../collision/AABB'
import * as vec2 from '../math/vec2'
import { Body } from '../objects/Body'
import type { World } from '../world/World'

/**
 * Base class for broadphase implementations. Don't use this class directly.
 */
export abstract class Broadphase {
    /**
     * Axis aligned bounding box type.
     */
    static AABB: 1

    /**
     * Bounding circle type.
     */
    static BOUNDING_CIRCLE: 2

    /**
     * Naive Broadphase
     */
    static NAIVE: 1

    /**
     * SAP Broadphase
     */
    static SAP: 2

    /**
     * Check whether the bounding radius of two bodies overlap.
     * @param bodyA
     * @param bodyB
     * @returns
     */
    static boundingRadiusCheck(bodyA: Body, bodyB: Body): boolean {
        const d2 = vec2.squaredDistance(bodyA.position, bodyB.position),
            r = bodyA.boundingRadius + bodyB.boundingRadius
        return d2 <= r * r
    }

    /**
     * Check whether the AABB of two bodies overlap.
     * @param bodyA
     * @param bodyB
     * @returns
     */
    static aabbCheck(bodyA: Body, bodyB: Body): boolean {
        return bodyA.getAABB().overlaps(bodyB.getAABB())
    }

    /**
     * Check whether two bodies are allowed to collide at all.
     * @param bodyA
     * @param bodyB
     */
    static canCollide(bodyA: Body, bodyB: Body): boolean {
        const KINEMATIC = Body.KINEMATIC
        const STATIC = Body.STATIC
        const typeA = bodyA.type
        const typeB = bodyB.type

        // Cannot collide static bodies
        if (typeA === STATIC && typeB === STATIC) {
            return false
        }

        // Cannot collide static vs kinematic bodies
        if ((typeA === KINEMATIC && typeB === STATIC) || (typeA === STATIC && typeB === KINEMATIC)) {
            return false
        }

        // Cannot collide kinematic vs kinematic
        if (typeA === KINEMATIC && typeB === KINEMATIC) {
            return false
        }

        // Cannot collide both sleeping bodies
        if (bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING) {
            return false
        }

        // Cannot collide if one is static and the other is sleeping
        if (
            (bodyA.sleepState === Body.SLEEPING && typeB === STATIC) ||
            (bodyB.sleepState === Body.SLEEPING && typeA === STATIC)
        ) {
            return false
        }

        return true
    }

    type: typeof Broadphase.NAIVE | typeof Broadphase.SAP

    /**
     * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
     */
    result: Body[]

    /**
     * The world to search for collision pairs in. To change it, use .setWorld()
     * @readOnly
     */
    world?: World

    /**
     * The bounding volume type to use in the broadphase algorithms. Should be set to Broadphase.AABB or Broadphase.BOUNDING_CIRCLE.
     */
    boundingVolumeType: typeof Broadphase.AABB | typeof Broadphase.BOUNDING_CIRCLE

    constructor(type: typeof Broadphase.NAIVE | typeof Broadphase.SAP) {
        this.type = type
        this.result = []
        this.world = undefined

        this.boundingVolumeType = Broadphase.AABB
    }

    /**
     * Get all potential intersecting body pairs.
     * @param world The world to search in.
     * @return An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
     */
    abstract getCollisionPairs(world: World): Body[]

    /**
     * Returns all the bodies within an AABB.
     * @param world
     * @param aabb
     * @param result
     */
    abstract aabbQuery(world?: World, aabb?: AABB, result?: Body[]): Body[]

    /**
     * Set the world that we are searching for collision pairs in.
     * @param world
     */
    setWorld(world: World): void {
        this.world = world
    }

    /**
     * Check whether the bounding volumes of two bodies overlap.
     * @param bodyA
     * @param bodyB
     */
    boundingVolumeCheck(bodyA: Body, bodyB: Body): boolean {
        switch (this.boundingVolumeType) {
            case Broadphase.BOUNDING_CIRCLE:
                return Broadphase.boundingRadiusCheck(bodyA, bodyB)
            case Broadphase.AABB:
                return Broadphase.aabbCheck(bodyA, bodyB)
            default:
                throw new Error('Bounding volume type not recognized: ' + this.boundingVolumeType)
        }
    }
}
