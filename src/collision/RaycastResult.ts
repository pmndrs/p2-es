import type { Vec2 } from 'types'

import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'
import { Ray } from './Ray'

/**
 * Storage for Ray casting hit data.
 */
export class RaycastResult {
    /**
     * The normal of the hit, oriented in world space.
     */
    normal: Vec2
    /**
     * The hit shape, or null.
     */
    shape: Shape | null

    /**
     * The hit body, or null.
     */
    body: Body | null

    /**
     * The index of the hit triangle, if the hit shape was indexable.
     * @default -1
     */
    faceIndex: number

    /**
     * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
     * @default -1
     */
    fraction: number

    /**
     * If the ray should stop traversing.
     * @readonly
     */
    isStopped: boolean

    constructor() {
        this.normal = vec2.create()
        this.shape = null
        this.body = null
        this.faceIndex = -1
        this.fraction = -1
        this.isStopped = false
    }

    /**
     * Reset all result data. Must be done before re-using the result object.
     * @method reset
     */
    reset(): void {
        vec2.set(this.normal, 0, 0)
        this.shape = null
        this.body = null
        this.faceIndex = -1
        this.fraction = -1
        this.isStopped = false
    }

    /**
     * Get the distance to the hit point.
     * @param ray
     * @return
     */
    getHitDistance(ray: Ray): number {
        return vec2.distance(ray.from, ray.to) * this.fraction
    }

    /**
     * Returns true if the ray hit something since the last reset().
     * @return
     */
    hasHit(): boolean {
        return this.fraction !== -1
    }

    /**
     * Get world hit point.
     * @param out
     * @param ray
     */
    getHitPoint(out: Vec2, ray: Ray): Vec2 {
        return vec2.lerp(out, ray.from, ray.to, this.fraction)
    }

    /**
     * Can be called while iterating over hits to stop searching for hit points.
     */
    stop(): void {
        this.isStopped = true
    }

    /**
     * @method shouldSto
     * @param ray
     * @return
     */
    shouldStop(ray: Ray): boolean {
        return this.isStopped || (this.fraction !== -1 && ray.mode === Ray.ANY)
    }

    /**
     * @method set
     * @param normal
     * @param shape
     * @param body
     * @param fraction
     * @param faceIndex
     */
    set(normal: Vec2, shape: Shape, body: Body, fraction: number, faceIndex: number) {
        vec2.copy(this.normal, normal)
        this.shape = shape
        this.body = body
        this.fraction = fraction
        this.faceIndex = faceIndex
    }
}
