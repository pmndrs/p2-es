import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'
import type { Vec2 } from '../types'
import type { AABB } from './AABB'
import type { RaycastResult } from './RaycastResult'

export type RayOptions = {
    /**
     * Ray start point.
     */
    from?: Vec2

    /**
     * Ray end point.
     */
    to?: Vec2

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     */
    checkCollisionResponse?: boolean

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     */
    skipBackfaces?: boolean

    /**
     * Collision mask
     */
    collisionMask?: number

    /**
     * Collision group
     */
    collisionGroup?: number

    /**
     * The intersection mode.
     */
    mode?: typeof Ray.CLOSEST | typeof Ray.ANY | typeof Ray.ALL

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     */
    callback?: (result: RaycastResult) => void
}

/**
 * A line with a start and end point that is used to intersect shapes.
 * @see {@link World.raycast} for example usage
 */
export class Ray {
    /**
     * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
     */
    static CLOSEST: 1 = 1

    /**
     * This raycasting mode will make the Ray stop when it finds the first intersection point.
     */
    static ANY: 2 = 2

    /**
     * This raycasting mode will traverse all intersection points and executes a callback for each one.
     */
    static ALL: 4 = 4

    /**
     * Ray start point.
     */
    from: Vec2

    /**
     * Ray end point
     */
    to: Vec2

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     */
    checkCollisionResponse: boolean

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     */
    skipBackfaces: boolean

    /**
     * Collision mask.
     * @default -1
     */
    collisionMask: number

    /**
     * Collision group.
     * @default -1
     */
    collisionGroup: number

    /**
     * The intersection mode.
     */
    mode: typeof Ray.CLOSEST | typeof Ray.ANY | typeof Ray.ALL

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     */
    callback: (result: RaycastResult) => void

    /**
     * The direction of the ray
     */
    direction: Vec2 = vec2.create()

    /**
     * Length of the ray
     */
    length = 1

    private _currentBody: Body | null = null
    private _currentShape: Shape | null = null

    /**
     * Constructor for a new Ray
     * @param options
     */
    constructor(options: RayOptions = {}) {
        this.from = options.from ? vec2.clone(options.from) : vec2.create()
        this.to = options.to ? vec2.clone(options.to) : vec2.create()

        this.checkCollisionResponse = options.checkCollisionResponse ?? true

        this.skipBackfaces = !!options.skipBackfaces

        this.collisionMask = options.collisionMask ?? -1
        this.collisionGroup = options.collisionGroup ?? -1

        this.mode = options.mode ?? Ray.ANY

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.callback = options?.callback || function (/*result*/) {}

        this.update()
    }

    /**
     * Should be called if you change the from or to point.
     */
    update(): void {
        // Update .direction and .length
        const d = this.direction
        vec2.subtract(d, this.to, this.from)
        this.length = vec2.length(d)
        vec2.normalize(d, d)
    }

    /**
     * @param bodies An array of Body objects.
     */
    intersectBodies(result: RaycastResult, bodies: Body[]): void {
        for (let i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
            const body = bodies[i]
            const aabb = body.getAABB()
            if (aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)) {
                this.intersectBody(result, body)
            }
        }
    }

    /**
     * Shoot a ray at a body, get back information about the hit.
     * @param body
     */
    intersectBody(result: RaycastResult, body: Body) {
        const checkCollisionResponse = this.checkCollisionResponse

        if (checkCollisionResponse && !body.collisionResponse) {
            return
        }

        const worldPosition = intersectBody_worldPosition

        for (let i = 0, N = body.shapes.length; i < N; i++) {
            const shape = body.shapes[i]

            if (checkCollisionResponse && !shape.collisionResponse) {
                continue // Skip
            }

            if (
                (this.collisionGroup & shape.collisionMask) === 0 ||
                (shape.collisionGroup & this.collisionMask) === 0
            ) {
                continue
            }

            // Get world angle and position of the shape
            vec2.rotate(worldPosition, shape.position, body.angle)
            vec2.add(worldPosition, worldPosition, body.position)
            const worldAngle = shape.angle + body.angle

            this.intersectShape(result, shape, worldAngle, worldPosition, body)

            if (result.shouldStop(this)) {
                break
            }
        }
    }

    /**
     * Shoot a ray at a shape, get back information about the hit
     * @param shape
     * @param angle
     * @param position
     * @param body
     */
    intersectShape(result: RaycastResult, shape: Shape, angle: number, position: Vec2, body: Body) {
        const from = this.from

        // Checking radius
        const distance = distanceFromIntersectionSquared(from, this.direction, position)
        if (distance > shape.boundingRadius * shape.boundingRadius) {
            return
        }

        this._currentBody = body
        this._currentShape = shape

        shape.raycast(result, this, position, angle)

        this._currentBody = this._currentShape = null
    }

    /**
     * Get the AABB of the ray.
     * @param aabb
     */
    getAABB(result: AABB): void {
        const to = this.to
        const from = this.from
        vec2.set(result.lowerBound, Math.min(to[0], from[0]), Math.min(to[1], from[1]))
        vec2.set(result.upperBound, Math.max(to[0], from[0]), Math.max(to[1], from[1]))
    }

    /**
     * @param fraction
     * @param normal
     * @param faceIndex
     */
    reportIntersection(result: RaycastResult, fraction: number, normal: Vec2, faceIndex = -1): void {
        const shape = this._currentShape as Shape
        const body = this._currentBody as Body

        // Skip back faces?
        if (this.skipBackfaces && vec2.dot(normal, this.direction) > 0) {
            return
        }

        switch (this.mode) {
            case Ray.ALL:
                result.set(normal, shape, body, fraction, faceIndex)
                this.callback(result)
                break

            case Ray.CLOSEST:
                // Store if closer than current closest
                if (fraction < result.fraction || !result.hasHit()) {
                    result.set(normal, shape, body, fraction, faceIndex)
                }
                break

            case Ray.ANY:
                // Report and stop.
                result.set(normal, shape, body, fraction, faceIndex)
                break
        }
    }
}

const v0 = vec2.create()
const intersect = vec2.create()

function distanceFromIntersectionSquared(from: Vec2, direction: Vec2, position: Vec2) {
    // v0 is vector from from to position
    vec2.subtract(v0, position, from)
    const dot = vec2.dot(v0, direction)

    // intersect = direction * dot + from
    vec2.scale(intersect, direction, dot)
    vec2.add(intersect, intersect, from)

    return vec2.squaredDistance(position, intersect)
}

const intersectBody_worldPosition = vec2.create()
