/* eslint-disable @typescript-eslint/no-empty-function */
import type { AABB } from '../collision/AABB'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import type { Material } from '../material/Material'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'

export interface SharedShapeOptions {
    /**
     * Body-local position of the shape.
     * @see {@link Shape.position}
     */
    position?: Vec2

    /**
     * Body-local angle of the shape.
     * @see {@link Shape.angle}
     */
    angle?: number

    /**
     * Collision group for the shape
     * @see {@link Shape.collisionGroup}
     */
    collisionGroup?: number

    /**
     * Collision mask for the shape
     * @see {@link Shape.collisionMask}
     */
    collisionMask?: number

    /**
     * Whether the shape is a sensor
     * @see {@link Shape.sensor}
     */
    sensor?: boolean

    /**
     * Whether to produce contact forces when in contact with other bodies.
     * @see {@link Shape.collisionResponse}
     */
    collisionResponse?: boolean

    /**
     * Material for the shape
     * @see {@link Shape.material}
     */
    material?: Material
}

export interface ShapeOptions extends SharedShapeOptions {
    type:
        | typeof Shape.CIRCLE
        | typeof Shape.PARTICLE
        | typeof Shape.PLANE
        | typeof Shape.CONVEX
        | typeof Shape.LINE
        | typeof Shape.BOX
        | typeof Shape.CAPSULE
        | typeof Shape.HEIGHTFIELD
}

/**
 * Base class for shapes. Not to be used directly.
 */
export abstract class Shape {
    /**
     * The body this shape is attached to. A shape can only be attached to a single body.
     */
    body: Body | null = null

    /**
     * Body-local position of the shape.
     */
    position: Vec2 = vec2.create()

    /**
     * Body-local angle of the shape.
     */
    angle: number

    /**
     * The type of the shape. One of:
     *
     * <ul>
     * <li><a href="Shape.html#property_CIRCLE">Shape.CIRCLE</a></li>
     * <li><a href="Shape.html#property_PARTICLE">Shape.PARTICLE</a></li>
     * <li><a href="Shape.html#property_PLANE">Shape.PLANE</a></li>
     * <li><a href="Shape.html#property_CONVEX">Shape.CONVEX</a></li>
     * <li><a href="Shape.html#property_LINE">Shape.LINE</a></li>
     * <li><a href="Shape.html#property_BOX">Shape.BOX</a></li>
     * <li><a href="Shape.html#property_CAPSULE">Shape.CAPSULE</a></li>
     * <li><a href="Shape.html#property_HEIGHTFIELD">Shape.HEIGHTFIELD</a></li>
     * </ul>
     */
    type:
        | typeof Shape.CIRCLE
        | typeof Shape.PARTICLE
        | typeof Shape.PLANE
        | typeof Shape.CONVEX
        | typeof Shape.LINE
        | typeof Shape.BOX
        | typeof Shape.CAPSULE
        | typeof Shape.HEIGHTFIELD

    /**
     * Shape object identifier
     */
    id: number

    /**
     * Bounding circle radius of this shape
     */
    boundingRadius = 0

    /**
     * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
     * 
     * @example
     *     // Setup bits for each available group
     *     var PLAYER = Math.pow(2,0),
     *         ENEMY =  Math.pow(2,1),
     *         GROUND = Math.pow(2,2)
     *
     *     // Put shapes into their groups
     *     player1Shape.collisionGroup = PLAYER;
     *     player2Shape.collisionGroup = PLAYER;
     *     enemyShape  .collisionGroup = ENEMY;
     *     groundShape .collisionGroup = GROUND;
     *
     *     // Assign groups that each shape collide with.
     *     // Note that the players can collide with ground and enemies, but not with other players.
     *     player1Shape.collisionMask = ENEMY | GROUND;
     *     player2Shape.collisionMask = ENEMY | GROUND;
     *     enemyShape  .collisionMask = PLAYER | GROUND;
     *     groundShape .collisionMask = PLAYER | ENEMY;
     *
     * @example
     *     // How collision check is done
     *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
     *         // The shapes will collide
     *     }
     */
    collisionGroup: number

    /**
     * Whether to produce contact forces when in contact with other bodies.
     * Note that contacts will be generated, but they will be disabled.
     * That means that this shape will move through other body shapes, but it will still trigger contact events, etc.
     */
    collisionResponse: boolean

    /**
     * Collision mask of this shape. See .collisionGroup.
     */
    collisionMask: number

    /**
     * Material to use in collisions for this Shape. If this is set to null, the world will use default material properties instead.
     */
    material: Material | null

    /**
     * Area of this shape.
     */
    area = 0

    /**
     * Set to true if you want this shape to be a sensor.
     * A sensor does not generate contacts, but it still reports contact events. This is good if you want to know if a shape is overlapping another shape, without them generating contacts.
     */
    sensor: boolean

    /**
     * ID counter for shapes
     */
    static idCounter = 0

    /**
     * Circle shape type
     */
    static CIRCLE = 1 as const

    /**
     * Particle shape type
     */
    static PARTICLE = 2 as const

    /**
     * Plane shape type
     */
    static PLANE = 4 as const

    /**
     * Convex shape type
     */
    static CONVEX = 8 as const

    /**
     * Line shape type
     */
    static LINE = 16 as const

    /**
     * Box shape type
     */
    static BOX = 32 as const

    /**
     * Capsule shape type
     */
    static CAPSULE = 64 as const

    /**
     * Heightfield shape type
     */
    static HEIGHTFIELD = 128 as const

    /**
     * Constructor for a Shape
     * @param options
     */
    constructor(options: ShapeOptions) {
        this.id = Shape.idCounter++
        this.body = null

        if (options.position) {
            vec2.copy(this.position, options.position)
        }

        this.type = options.type
        this.angle = options.angle ?? 0
        this.collisionGroup = options.collisionGroup ?? 1
        this.collisionResponse = options.collisionResponse ?? true
        this.collisionMask = options.collisionMask ?? 1
        this.sensor = options.sensor ?? false
        this.material = options.material ?? null
    }

    /**
     * Should return the moment of inertia around the Z axis of the body.
     * See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
     * @return If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
     */
    abstract computeMomentOfInertia(): number

    /**
     * Compute the world axis-aligned bounding box (AABB) of this shape.
     * @param out The resulting AABB.
     * @param position World position of the shape.
     * @param angle World angle of the shape.
     */
    abstract computeAABB(out?: AABB, position?: Vec2, angle?: number): void

    /**
     * Updates the bounding circle radius of this shape.
     */
    updateBoundingRadius(): void {}

    /**
     * Update the .area property of the shape.
     */
    updateArea(): void {}

    /**
     * Perform raycasting on this shape.
     * @param result Where to store the resulting data.
     * @param ray The Ray that you want to use for raycasting.
     * @param position World position of the shape (the .position property will be ignored).
     * @param angle World angle of the shape (the .angle property will be ignored).
     */
    raycast(_result: RaycastResult, _ray: Ray, _position: Vec2, _angle: number): void {}

    /**
     * Test if a point is inside this shape.
     * @param _localPoint
     * @return whether a point is inside this shape
     */
    pointTest(_localPoint: Vec2): boolean {
        return false
    }

    /**
     * Transform a world point to local shape space (assumed the shape is transformed by both itself and the body).
     * @param out
     * @param worldPoint
     */
    worldPointToLocal(out: Vec2, worldPoint: Vec2): Vec2 {
        const body = this.body

        vec2.rotate(shapeWorldPosition, this.position, body!.angle)
        vec2.add(shapeWorldPosition, shapeWorldPosition, body!.position)

        vec2.toLocalFrame(out, worldPoint, shapeWorldPosition, this.body!.angle + this.angle)

        return out
    }
}

const shapeWorldPosition = vec2.create()
