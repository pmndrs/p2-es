import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import * as polyk from '../math/polyk'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

export interface ConvexOptions extends SharedShapeOptions {
    /**
     * Vertices defined in the local frame.
     * @see {@link Convex.vertices}
     */
    vertices?: Vec2[]

    /**
     * Axes.
     * @see {@link Convex.axes}
     */
    axes?: Vec2[]

    /**
     * The shape type.
     */
    type?: Shape['type']
}

/**
 * Convex shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
 *     var convexShape = new Convex({
 *         vertices: vertices
 *     });
 *     body.addShape(convexShape);
 */
export class Convex extends Shape {
    /**
     * Vertices defined in the local frame.
     */
    vertices: Vec2[]

    /**
     * Axes
     */
    axes: Vec2[]

    /**
     * Edge normals defined in the local frame, pointing out of the shape.
     */
    normals: Vec2[]

    /**
     * The center of mass of the Convex
     */
    centerOfMass: Vec2

    /**
     * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
     */
    triangles: Vec2[]

    /**
     * The bounding radius of the convex
     */
    boundingRadius: number

    /**
     * Constructor for Convex shape
     * @param options
     */
    constructor(options: ConvexOptions = {}) {
        const params = {
            ...options,
            type: options.type ?? Shape.CONVEX,
            vertices: options.vertices ?? [],
            axes: options.axes ?? [],
        }

        super(params)

        this.axes = params.axes

        // Copy the verts
        this.vertices = []
        for (let i = 0; i < params.vertices.length; i++) {
            this.vertices.push(vec2.clone(params.vertices[i]))
        }

        this.normals = []
        for (let i = 0; i < params.vertices.length; i++) {
            this.normals.push(vec2.create())
        }
        this.updateNormals()

        this.centerOfMass = vec2.create()

        this.triangles = []

        if (this.vertices.length) {
            this.updateTriangles()
            this.updateCenterOfMass()
        }

        this.boundingRadius = 0

        this.updateBoundingRadius()
        this.updateArea()
        if (this.area < 0) {
            throw new Error('Convex vertices must be given in counter-clockwise winding.')
        }
    }

    updateNormals(): void {
        for (let i = 0; i < this.vertices.length; i++) {
            const worldPoint0 = this.vertices[i]
            const worldPoint1 = this.vertices[(i + 1) % this.vertices.length]

            const normal = this.normals[i]
            vec2.subtract(normal, worldPoint1, worldPoint0)

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate90cw(normal, normal)
            vec2.normalize(normal, normal)
        }
    }

    /**
     * Project a Convex onto a world-oriented axis
     * @param offset
     * @param localAxis
     * @param result
     */
    projectOntoLocalAxis(localAxis: Vec2, result: Vec2): void {
        let max = 0
        let min = 0
        localAxis = tmpVec1

        // Get projected position of all vertices
        for (let i = 0; i < this.vertices.length; i++) {
            const v = this.vertices[i]
            const value = vec2.dot(v, localAxis)
            if (max === null || value > max) {
                max = value
            }
            if (min === null || value < min) {
                min = value
            }
        }

        if (min > max) {
            const t = min
            min = max
            max = t
        }

        vec2.set(result, min as number, max)
    }

    projectOntoWorldAxis(localAxis: Vec2, shapeOffset: Vec2, shapeAngle: number, result: Vec2): void {
        let worldAxis = tmpVec2

        this.projectOntoLocalAxis(localAxis, result)

        // Project the position of the body onto the axis - need to add this to the result
        if (shapeAngle !== 0) {
            vec2.rotate(worldAxis, localAxis, shapeAngle)
        } else {
            worldAxis = localAxis
        }
        const offset = vec2.dot(shapeOffset, worldAxis)

        vec2.set(result, result[0] + offset, result[1] + offset)
    }

    /**
     * Update the .triangles property
     */
    updateTriangles(): void {
        this.triangles.length = 0

        // Rewrite on polyk notation, array of numbers
        const polykVerts = []
        for (let i = 0; i < this.vertices.length; i++) {
            const v = this.vertices[i]
            polykVerts.push(v[0], v[1])
        }

        // Triangulate
        const triangles = polyk.triangulate(polykVerts)

        // Loop over all triangles, add their inertia contributions to I
        for (let i = 0; i < triangles.length; i += 3) {
            const id1 = triangles[i],
                id2 = triangles[i + 1],
                id3 = triangles[i + 2]

            // Add to triangles
            this.triangles.push([id1, id2, id3])
        }
    }

    /**
     * Update the .centerOfMass property.
     */
    updateCenterOfMass(): void {
        const triangles = this.triangles,
            verts = this.vertices,
            cm = this.centerOfMass,
            centroid = updateCenterOfMass_centroid

        let a = updateCenterOfMass_a,
            b = updateCenterOfMass_b,
            c = updateCenterOfMass_c

        const centroid_times_mass = updateCenterOfMass_centroid_times_mass

        vec2.set(cm, 0, 0)
        let totalArea = 0

        for (let i = 0; i !== triangles.length; i++) {
            const t = triangles[i]
            ;(a = verts[t[0]]), (b = verts[t[1]]), (c = verts[t[2]])

            vec2.centroid(centroid, a, b, c)

            // Get mass for the triangle (density=1 in this case)
            // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
            const m = Convex.triangleArea(a, b, c)
            totalArea += m

            // Add to center of mass
            vec2.scale(centroid_times_mass, centroid, m)
            vec2.add(cm, cm, centroid_times_mass)
        }

        vec2.scale(cm, cm, 1 / totalArea)
    }

    /**
     * Compute the moment of inertia of the Convex.
     * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
     */
    computeMomentOfInertia(): number {
        let denom = 0.0,
            numer = 0.0
        const N = this.vertices.length
        for (let j = N - 1, i = 0; i < N; j = i, i++) {
            const p0 = this.vertices[j]
            const p1 = this.vertices[i]
            const a = Math.abs(vec2.crossLength(p0, p1))
            const b = vec2.dot(p1, p1) + vec2.dot(p1, p0) + vec2.dot(p0, p0)
            denom += a * b
            numer += a
        }
        return (1.0 / 6.0) * (denom / numer)
    }

    /**
     * Updates the .boundingRadius property
     */
    updateBoundingRadius(): void {
        const verts = this.vertices
        let r2 = 0

        for (let i = 0; i !== verts.length; i++) {
            const l2 = vec2.squaredLength(verts[i])
            if (l2 > r2) {
                r2 = l2
            }
        }

        this.boundingRadius = Math.sqrt(r2)
    }

    /**
     * Update the .area
     */
    updateArea(): void {
        this.updateTriangles()
        this.area = 0

        const triangles = this.triangles,
            verts = this.vertices
        for (let i = 0; i !== triangles.length; i++) {
            const t = triangles[i],
                a = verts[t[0]],
                b = verts[t[1]],
                c = verts[t[2]]

            // Get mass for the triangle (density=1 in this case)
            const m = Convex.triangleArea(a, b, c)
            this.area += m
        }
    }

    // todo - approximate with a local AABB?
    computeAABB(out: AABB, position: Vec2, angle: number): void {
        out.setFromPoints(this.vertices, position, angle, 0)
    }

    /**
     * raycast
     * @param result
     * @param ray
     * @param position
     * @param angle
     */
    raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void {
        const rayStart = intersectConvex_rayStart
        const rayEnd = intersectConvex_rayEnd
        const normal = intersectConvex_normal
        const vertices = this.vertices

        // Transform to local shape space
        vec2.toLocalFrame(rayStart, ray.from, position, angle)
        vec2.toLocalFrame(rayEnd, ray.to, position, angle)

        const n = vertices.length

        for (let i = 0; i < n && !result.shouldStop(ray); i++) {
            const q1 = vertices[i]
            const q2 = vertices[(i + 1) % n]
            const delta = vec2.getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2)

            if (delta >= 0) {
                vec2.subtract(normal, q2, q1)
                vec2.rotate(normal, normal, -Math.PI / 2 + angle)
                vec2.normalize(normal, normal)
                ray.reportIntersection(result, delta, normal, i)
            }
        }
    }

    pointTest(localPoint: Vec2): boolean {
        const r0 = pic_r0,
            r1 = pic_r1,
            verts = this.vertices,
            numVerts = verts.length
        let lastCross = null

        for (let i = 0; i < numVerts + 1; i++) {
            const v0 = verts[i % numVerts],
                v1 = verts[(i + 1) % numVerts]

            vec2.subtract(r0, v0, localPoint)
            vec2.subtract(r1, v1, localPoint)

            const cross = vec2.crossLength(r0, r1)

            if (lastCross === null) {
                lastCross = cross
            }

            // If we got a different sign of the distance vector, the point is out of the polygon
            if (cross * lastCross < 0) {
                return false
            }
            lastCross = cross
        }
        return true
    }

    /**
     * Get the area of the triangle spanned by the three points a, b, c.
     * The area is positive if the points are given in counter-clockwise order, otherwise negative.
     * @param a
     * @param b
     * @param c
     * @return
     */
    static triangleArea(a: Vec2, b: Vec2, c: Vec2): number {
        return ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) * 0.5
    }
}

const tmpVec1 = vec2.create()
const tmpVec2 = vec2.create()

const updateCenterOfMass_centroid = vec2.create()
const updateCenterOfMass_centroid_times_mass = vec2.create()
const updateCenterOfMass_a = vec2.create()
const updateCenterOfMass_b = vec2.create()
const updateCenterOfMass_c = vec2.create()

const intersectConvex_rayStart = vec2.create()
const intersectConvex_rayEnd = vec2.create()
const intersectConvex_normal = vec2.create()

const pic_r0 = vec2.create()
const pic_r1 = vec2.create()
