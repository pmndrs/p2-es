import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import { Utils } from '../utils/Utils'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

const intersectPlane_planePointToFrom = vec2.create()
const intersectPlane_normal = vec2.create()
const intersectPlane_len = vec2.create()

/**
 * Plane shape class. The plane is facing in the Y direction.
 *
 * @example
 *     var body = new Body();
 *     var shape = new Plane();
 *     body.addShape(shape);
 */
export class Plane extends Shape {
    constructor(options?: SharedShapeOptions) {
        options = options ? Utils.shallowClone(options) : {}
        super(options)

        this.updateBoundingRadius()
        this.updateArea()
    }

    computeMomentOfInertia(): number {
        return 0 // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
    }

    updateBoundingRadius(): void {
        this.boundingRadius = Number.MAX_VALUE
    }

    updateArea(): void {
        this.area = Number.MAX_VALUE
    }

    computeAABB(out: AABB, position: Vec2, angle: number) {
        const a = angle % (2 * Math.PI)
        const set = vec2.set
        const max = 1e7
        const lowerBound = out.lowerBound
        const upperBound = out.upperBound

        // Set max bounds
        set(lowerBound, -max, -max)
        set(upperBound, max, max)

        if (a === 0) {
            // y goes from -inf to 0
            upperBound[1] = position[1]
        } else if (a === Math.PI / 2) {
            // x goes from 0 to inf
            lowerBound[0] = position[0]
        } else if (a === Math.PI) {
            // y goes from 0 to inf
            lowerBound[1] = position[1]
        } else if (a === (3 * Math.PI) / 2) {
            // x goes from -inf to 0
            upperBound[0] = position[0]
        }
    }

    raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void {
        const from = ray.from
        const to = ray.to
        const direction = ray.direction
        const planePointToFrom = intersectPlane_planePointToFrom
        const normal = intersectPlane_normal
        const len = intersectPlane_len

        // Get plane normal
        vec2.set(normal, 0, 1)
        vec2.rotate(normal, normal, angle)

        vec2.subtract(len, from, position)
        const planeToFrom = vec2.dot(len, normal)
        vec2.subtract(len, to, position)
        const planeToTo = vec2.dot(len, normal)

        if (planeToFrom * planeToTo > 0) {
            // "from" and "to" are on the same side of the plane... bail out
            return
        }

        if (vec2.squaredDistance(from, to) < planeToFrom * planeToFrom) {
            return
        }

        const n_dot_dir = vec2.dot(normal, direction)

        vec2.subtract(planePointToFrom, from, position)
        const t = -vec2.dot(normal, planePointToFrom) / n_dot_dir / ray.length

        ray.reportIntersection(result, t, normal, -1)
    }

    pointTest(localPoint: Vec2) {
        return localPoint[1] <= 0
    }
}
