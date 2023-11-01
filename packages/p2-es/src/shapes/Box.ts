import type { AABB } from '../collision/AABB'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { ConvexOptions } from './Convex'
import { Convex } from './Convex'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

/**
 * (Note that this options object will be passed on to the {@link Shape} constructor.)
 */
export interface BoxOptions extends SharedShapeOptions {
    /**
     * Total width of the box
     * @see {@link Box.width}
     */
    width?: number

    /**
     * Total height of the box
     * @see {@link Box.height}
     */
    height?: number
}

/**
 * Box shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var boxShape = new Box({
 *         width: 2,
 *         height: 1
 *     });
 *     body.addShape(boxShape);
 */
export class Box extends Convex {
    /**
     * Total width of the box
     */
    width: number

    /**
     * Total height of the box
     */
    height: number

    constructor(options: BoxOptions = {}) {
        const width = options.width ?? 1
        const height = options.height ?? 1

        const verts = [
            vec2.fromValues(-width / 2, -height / 2),
            vec2.fromValues(width / 2, -height / 2),
            vec2.fromValues(width / 2, height / 2),
            vec2.fromValues(-width / 2, height / 2),
        ]

        const convexOptions: ConvexOptions = { ...options, type: Shape.BOX, vertices: verts }

        super(convexOptions)

        this.width = width
        this.height = height

        this.updateBoundingRadius()
        this.updateArea()
    }

    /**
     * Compute moment of inertia
     */
    computeMomentOfInertia(): number {
        const w = this.width
        const h = this.height
        return (h * h + w * w) / 12
    }

    /**
     * Update the bounding radius
     */
    updateBoundingRadius(): void {
        const w = this.width,
            h = this.height
        this.boundingRadius = Math.sqrt(w * w + h * h) / 2
    }

    /**
     * @param out The resulting AABB.
     * @param position
     * @param angle
     */
    computeAABB(out: AABB, position: Vec2, angle: number) {
        const c = Math.abs(Math.cos(angle))
        const s = Math.abs(Math.sin(angle))
        const w = this.width
        const h = this.height

        const height = (w * s + h * c) * 0.5
        const width = (h * s + w * c) * 0.5

        const l = out.lowerBound
        const u = out.upperBound
        const px = position[0]
        const py = position[1]
        l[0] = px - width
        l[1] = py - height
        u[0] = px + width
        u[1] = py + height
    }

    updateArea(): void {
        this.area = this.width * this.height
    }

    pointTest(localPoint: Vec2): boolean {
        return Math.abs(localPoint[0]) <= this.width * 0.5 && Math.abs(localPoint[1]) <= this.height * 0.5
    }
}
