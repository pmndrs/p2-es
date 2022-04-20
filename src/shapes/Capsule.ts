import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

/**
 * Options for creating a {@link Capsule}
 */
export interface CapsuleOptions extends SharedShapeOptions {
    /**
     * The distance between the end points, extends along the X axis.
     * @see {@link Capsule.length}
     */
    length?: number

    /**
     * Radius of the capsule.
     * @see {@link Capsule.radius}
     */
    radius?: number
}

/**
 * Capsule shape.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var capsuleShape = new Capsule({
 *         length: 1,
 *         radius: 2
 *     });
 *     body.addShape(capsuleShape);
 */
export class Capsule extends Shape {
    /**
     * The distance between the end points, extends along the X axis.
     */
    length: number

    /**
     * Radius of the capsule.
     */
    radius: number

    constructor(options: CapsuleOptions = {}) {
        const params = {
            ...options,
            type: Shape.CAPSULE,
            length: options.length ?? 1,
            radius: options.radius ?? 1,
        }

        super(params)

        this.length = params.length
        this.radius = params.radius

        this.updateBoundingRadius()
        this.updateArea()
    }

    /**
     * Compute the mass moment of inertia of the Capsule.
     */
    computeMomentOfInertia(): number {
        // http://www.efunda.com/math/areas/rectangle.cfm
        function boxI(w: number, h: number) {
            return (w * h * (Math.pow(w, 2) + Math.pow(h, 2))) / 12
        }
        function semiA(r: number) {
            return (Math.PI * Math.pow(r, 2)) / 2
        }
        // http://www.efunda.com/math/areas/CircleHalf.cfm
        function semiI(r: number) {
            return (Math.PI / 4 - 8 / (9 * Math.PI)) * Math.pow(r, 4)
        }
        function semiC(r: number) {
            return (4 * r) / (3 * Math.PI)
        }
        // https://en.wikipedia.org/wiki/Second_moment_of_area#Parallel_axis_theorem
        function capsuleA(l: number, r: number) {
            return l * 2 * r + Math.PI * Math.pow(r, 2)
        }
        function capsuleI(l: number, r: number) {
            const d = l / 2 + semiC(r)
            return boxI(l, 2 * r) + 2 * (semiI(r) + semiA(r) * Math.pow(d, 2))
        }
        const r = this.radius,
            l = this.length,
            area = capsuleA(l, r)
        return area > 0 ? capsuleI(l, r) / area : 0
    }

    updateArea(): void {
        this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length
    }

    updateBoundingRadius(): void {
        this.boundingRadius = this.radius + this.length / 2
    }

    computeAABB(out: AABB, position: Vec2, angle: number) {
        const radius = this.radius

        // Compute center position of one of the the circles, world oriented, but with local offset
        vec2.set(r, this.length / 2, 0)
        if (angle !== 0) {
            vec2.rotate(r, r, angle)
        }

        // Get bounds
        vec2.set(out.upperBound, Math.max(r[0] + radius, -r[0] + radius), Math.max(r[1] + radius, -r[1] + radius))
        vec2.set(out.lowerBound, Math.min(r[0] - radius, -r[0] - radius), Math.min(r[1] - radius, -r[1] - radius))

        // Add offset
        vec2.add(out.lowerBound, out.lowerBound, position)
        vec2.add(out.upperBound, out.upperBound, position)
    }

    raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number) {
        const from = ray.from
        const to = ray.to

        const hitPointWorld = intersectCapsule_hitPointWorld
        const normal = intersectCapsule_normal
        const l0 = intersectCapsule_l0
        const l1 = intersectCapsule_l1

        // The sides
        const halfLen = this.length / 2
        for (let i = 0; i < 2; i++) {
            // get start and end of the line
            const y = this.radius * (i * 2 - 1)
            vec2.set(l0, -halfLen, y)
            vec2.set(l1, halfLen, y)
            vec2.toGlobalFrame(l0, l0, position, angle)
            vec2.toGlobalFrame(l1, l1, position, angle)

            const delta = vec2.getLineSegmentsIntersectionFraction(from, to, l0, l1)
            if (delta >= 0) {
                vec2.rotate(normal, intersectCapsule_unit_y, angle)
                vec2.scale(normal, normal, i * 2 - 1)
                ray.reportIntersection(result, delta, normal, -1)
                if (result.shouldStop(ray)) {
                    return
                }
            }
        }

        // Circles
        const diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2)
        for (let i = 0; i < 2; i++) {
            vec2.set(l0, halfLen * (i * 2 - 1), 0)
            vec2.toGlobalFrame(l0, l0, position, angle)

            const a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2)
            const b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]))
            const c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2)
            const delta = Math.pow(b, 2) - 4 * a * c

            if (delta < 0) {
                // No intersection
                continue
            } else if (delta === 0) {
                // single intersection point
                vec2.lerp(hitPointWorld, from, to, delta)

                if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                    vec2.subtract(normal, hitPointWorld, l0)
                    vec2.normalize(normal, normal)
                    ray.reportIntersection(result, delta, normal, -1)
                    if (result.shouldStop(ray)) {
                        return
                    }
                }
            } else {
                const sqrtDelta = Math.sqrt(delta)
                const inv2a = 1 / (2 * a)
                const d1 = (-b - sqrtDelta) * inv2a
                const d2 = (-b + sqrtDelta) * inv2a

                if (d1 >= 0 && d1 <= 1) {
                    vec2.lerp(hitPointWorld, from, to, d1)
                    if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                        vec2.subtract(normal, hitPointWorld, l0)
                        vec2.normalize(normal, normal)
                        ray.reportIntersection(result, d1, normal, -1)
                        if (result.shouldStop(ray)) {
                            return
                        }
                    }
                }

                if (d2 >= 0 && d2 <= 1) {
                    vec2.lerp(hitPointWorld, from, to, d2)
                    if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                        vec2.subtract(normal, hitPointWorld, l0)
                        vec2.normalize(normal, normal)
                        ray.reportIntersection(result, d2, normal, -1)
                        if (result.shouldStop(ray)) {
                            return
                        }
                    }
                }
            }
        }
    }

    pointTest(localPoint: Vec2): boolean {
        const radius = this.radius
        const halfLength = this.length * 0.5

        if (Math.abs(localPoint[0]) <= halfLength && Math.abs(localPoint[1]) <= radius) {
            return true
        }

        if (Math.pow(localPoint[0] - halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
            return true
        }

        if (Math.pow(localPoint[0] + halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
            return true
        }

        return false
    }
}

const r = vec2.create()

const intersectCapsule_hitPointWorld = vec2.create()
const intersectCapsule_normal = vec2.create()
const intersectCapsule_l0 = vec2.create()
const intersectCapsule_l1 = vec2.create()
const intersectCapsule_unit_y = vec2.fromValues(0, 1)
