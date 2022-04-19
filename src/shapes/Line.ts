import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

export interface LineOptions extends SharedShapeOptions {
    length?: number
}

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 *
 * @example
 *     var body = new Body();
 *     var lineShape = new Line({
 *         length: 1
 *     });
 *     body.addShape(lineShape);
 */
export class Line extends Shape {
    /**
     * Length of this line
     * @default 1
     */
    length: number

    constructor(options: LineOptions = {}) {
        const params = {
            ...options,
            type: Shape.LINE,
            length: options.length ?? 1,
        }

        super(params)

        this.length = params.length

        this.updateBoundingRadius()
        this.updateArea()
    }

    computeMomentOfInertia(): number {
        return Math.pow(this.length, 2) / 12
    }

    updateBoundingRadius(): void {
        this.boundingRadius = this.length / 2
    }

    computeAABB(out: AABB, position: Vec2, angle: number): void {
        const l2 = this.length / 2
        vec2.set(points[0], -l2, 0)
        vec2.set(points[1], l2, 0)
        out.setFromPoints(points, position, angle, 0)
    }

    raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number) {
        const from = ray.from
        const to = ray.to

        const l0 = raycast_l0
        const l1 = raycast_l1

        // get start and end of the line
        const halfLen = this.length / 2
        vec2.set(l0, -halfLen, 0)
        vec2.set(l1, halfLen, 0)
        vec2.toGlobalFrame(l0, l0, position, angle)
        vec2.toGlobalFrame(l1, l1, position, angle)

        const fraction = vec2.getLineSegmentsIntersectionFraction(from, to, l0, l1)
        if (fraction >= 0) {
            const normal = raycast_normal
            vec2.rotate(normal, raycast_unit_y, angle) // todo: this should depend on which side the ray comes from
            ray.reportIntersection(result, fraction, normal, -1)
        }
    }
}

const points = [vec2.create(), vec2.create()]

const raycast_normal = vec2.create()
const raycast_l0 = vec2.create()
const raycast_l1 = vec2.create()
const raycast_unit_y = vec2.fromValues(0, 1)
