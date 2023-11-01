import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

export interface HeightfieldOptions extends SharedShapeOptions {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     * @see {@link Heightfield.heights}
     */
    heights?: number[]

    /**
     * Min value of the heights
     * @see {@link Heightfield.minValue}
     */
    minValue?: number

    /**
     * Max value of the heights
     * @see {@link Heightfield.maxValue}
     */
    maxValue?: number

    /**
     * The width of each element
     * @see {@link Heightfield.elementWidth}
     */
    elementWidth?: number
}

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 *
 * @example
 *     // Generate some height data (y-values).
 *     var heights = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         heights.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var shape = new Heightfield({
 *         heights: heights,
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
 *     var body = new Body();
 *     body.addShape(shape);
 *     world.addBody(body);
 *
 * @todo Should use a scale property with X and Y direction instead of just elementWidth
 */
export class Heightfield extends Shape {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     */
    heights: number[]

    /**
     * Max value of the heights
     */
    maxValue?: number

    /**
     * Min value of the heights
     */
    minValue?: number

    /**
     * The width of each element
     */
    elementWidth: number

    constructor(options: HeightfieldOptions = {}) {
        const params = {
            elementWidth: 0.1,
            ...options,
            type: Shape.HEIGHTFIELD,
            heights: options.heights ? [...options.heights] : [],
        }

        super(params)

        this.heights = params.heights
        this.maxValue = params.maxValue
        this.minValue = params.minValue
        this.elementWidth = params.elementWidth

        if (params.maxValue === undefined || params.minValue === undefined) {
            this.updateMaxMinValues()
        }

        this.updateBoundingRadius()
        this.updateArea()
    }

    updateMaxMinValues(): void {
        const data = this.heights
        let maxValue = data[0]
        let minValue = data[0]
        for (let i = 0; i !== data.length; i++) {
            const v = data[i]
            if (v > maxValue) {
                maxValue = v
            }
            if (v < minValue) {
                minValue = v
            }
        }
        this.maxValue = maxValue
        this.minValue = minValue
    }

    computeMomentOfInertia(): number {
        return Number.MAX_VALUE
    }

    updateBoundingRadius(): void {
        this.boundingRadius = Number.MAX_VALUE
    }

    updateArea(): void {
        const data = this.heights
        let area = 0
        for (let i = 0; i < data.length - 1; i++) {
            area += ((data[i] + data[i + 1]) / 2) * this.elementWidth
        }
        this.area = area
    }

    computeAABB(out: AABB, position: Vec2, angle: number): void {
        vec2.set(points[0], 0, this.maxValue!)
        vec2.set(points[1], this.elementWidth * this.heights.length, this.maxValue!)
        vec2.set(points[2], this.elementWidth * this.heights.length, this.minValue!)
        vec2.set(points[3], 0, this.minValue!)
        out.setFromPoints(points, position, angle)
    }

    /**
     * Get a line segment in the heightfield
     * @param start Where to store the resulting start point
     * @param end Where to store the resulting end point
     * @param i
     */
    getLineSegment(start: Vec2, end: Vec2, i: number): void {
        const data = this.heights
        const width = this.elementWidth
        vec2.set(start, i * width, data[i])
        vec2.set(end, (i + 1) * width, data[i + 1])
    }

    getSegmentIndex(position: Vec2): number {
        return Math.floor(position[0] / this.elementWidth)
    }

    getClampedSegmentIndex(position: Vec2): number {
        let i = this.getSegmentIndex(position)
        i = Math.min(this.heights.length, Math.max(i, 0)) // clamp
        return i
    }

    raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number) {
        const from = ray.from
        const to = ray.to

        const worldNormal = intersectHeightfield_worldNormal
        const l0 = intersectHeightfield_l0
        const l1 = intersectHeightfield_l1
        const localFrom = intersectHeightfield_localFrom
        const localTo = intersectHeightfield_localTo

        // get local ray start and end
        vec2.toLocalFrame(localFrom, from, position, angle)
        vec2.toLocalFrame(localTo, to, position, angle)

        // Get the segment range
        let i0 = this.getClampedSegmentIndex(localFrom)
        let i1 = this.getClampedSegmentIndex(localTo)
        if (i0 > i1) {
            const tmp = i0
            i0 = i1
            i1 = tmp
        }

        // The segments
        for (let i = 0; i < this.heights.length - 1; i++) {
            this.getLineSegment(l0, l1, i)
            const t = vec2.getLineSegmentsIntersectionFraction(localFrom, localTo, l0, l1)
            if (t >= 0) {
                vec2.subtract(worldNormal, l1, l0)
                vec2.rotate(worldNormal, worldNormal, angle + Math.PI / 2)
                vec2.normalize(worldNormal, worldNormal)
                ray.reportIntersection(result, t, worldNormal, -1)
                if (result.shouldStop(ray)) {
                    return
                }
            }
        }
    }
}

const points = [vec2.create(), vec2.create(), vec2.create(), vec2.create()]

const intersectHeightfield_worldNormal = vec2.create()
const intersectHeightfield_l0 = vec2.create()
const intersectHeightfield_l1 = vec2.create()
const intersectHeightfield_localFrom = vec2.create()
const intersectHeightfield_localTo = vec2.create()
