import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

/**
 * (Note that this options object will be passed on to the {@link Shape} constructor.)
 */
export interface CircleOptions extends SharedShapeOptions {
    /**
     * The radius of the circle.
     * @see {@link Circle.radius}
     */
    radius?: number
}

/**
 * Circle shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var circleShape = new Circle({
 *         radius: 1
 *     });
 *     body.addShape(circleShape);
 */
export class Circle extends Shape {
    /**
     * The radius of the circle.
     */
    radius: number

    constructor(options: CircleOptions = {}) {
        const params = {
            ...options,
            type: Shape.CIRCLE,
            radius: options.radius ?? 1,
        }

        super(params)
        
        this.radius = params.radius

        this.updateBoundingRadius()
        this.updateArea()
    }

    updateBoundingRadius(): void {
        this.boundingRadius = this.radius
    }

    computeMomentOfInertia(): number {
        const r = this.radius
        return (r * r) / 2
    }

    updateArea(): void {
        this.area = Math.PI * this.radius * this.radius
    }

    computeAABB(out: AABB, position: Vec2): void {
        const r = this.radius
        vec2.set(out.upperBound, r, r)
        vec2.set(out.lowerBound, -r, -r)
        if (position) {
            vec2.add(out.lowerBound, out.lowerBound, position)
            vec2.add(out.upperBound, out.upperBound, position)
        }
    }

    raycast(result: RaycastResult, ray: Ray, position: Vec2): void {
        const from = ray.from,
            to = ray.to,
            r = this.radius

        const a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2)
        const b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]))
        const c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2)
        const delta = Math.pow(b, 2) - 4 * a * c

        const intersectionPoint = Ray_intersectSphere_intersectionPoint
        const normal = Ray_intersectSphere_normal

        if (delta < 0) {
            // No intersection
            return
        } else if (delta === 0) {
            // single intersection point
            vec2.lerp(intersectionPoint, from, to, delta)

            vec2.subtract(normal, intersectionPoint, position)
            vec2.normalize(normal, normal)

            ray.reportIntersection(result, delta, normal, -1)
        } else {
            const sqrtDelta = Math.sqrt(delta)
            const inv2a = 1 / (2 * a)
            const d1 = (-b - sqrtDelta) * inv2a
            const d2 = (-b + sqrtDelta) * inv2a

            if (d1 >= 0 && d1 <= 1) {
                vec2.lerp(intersectionPoint, from, to, d1)

                vec2.subtract(normal, intersectionPoint, position)
                vec2.normalize(normal, normal)

                ray.reportIntersection(result, d1, normal, -1)

                if (result.shouldStop(ray)) {
                    return
                }
            }

            if (d2 >= 0 && d2 <= 1) {
                vec2.lerp(intersectionPoint, from, to, d2)

                vec2.subtract(normal, intersectionPoint, position)
                vec2.normalize(normal, normal)

                ray.reportIntersection(result, d2, normal, -1)
            }
        }
    }

    pointTest(localPoint: Vec2): boolean {
        const radius = this.radius
        return vec2.squaredLength(localPoint) <= radius * radius
    }
}

const Ray_intersectSphere_intersectionPoint = vec2.create()
const Ray_intersectSphere_normal = vec2.create()
