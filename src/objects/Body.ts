import * as decomp from 'poly-decomp-es'

import { AABB } from '../collision/AABB'
import { Ray } from '../collision/Ray'
import { RaycastResult } from '../collision/RaycastResult'
import { EventEmitter } from '../events/EventEmitter'
import * as vec2 from '../math/vec2'
import { add, create as vec2create, subtract } from '../math/vec2'
import { Convex } from '../shapes/Convex'
import type { Shape } from '../shapes/Shape'
import type { Vec2 } from '../types'
import type { World } from '../world/World'

export interface BodyOptions {
    type?: typeof Body.DYNAMIC | typeof Body.STATIC | typeof Body.KINEMATIC
    force?: Vec2
    position?: Vec2
    velocity?: Vec2
    allowSleep?: boolean
    collisionResponse?: boolean
    angle?: number
    angularDamping?: number
    angularForce?: number
    angularVelocity?: number
    ccdIterations?: number
    ccdSpeedThreshold?: number
    damping?: number
    fixedRotation?: boolean
    gravityScale?: number
    id?: number
    mass?: number
    sleepSpeedLimit?: number
    sleepTimeLimit?: number
    fixedX?: boolean
    fixedY?: boolean
}

export type SleepyEvent = {
    type: 'sleepy',
}

export type SleepEvent = {
    type: 'sleep',
}

export type WakeUpEvent = {
    type: 'wakeup',
}

export type BodyEventMap = {
    sleepy: SleepyEvent
    sleep: SleepEvent
    wakeup: WakeUpEvent
}

/**
 * A rigid body. Has got a center of mass, position, velocity and a number of
 * shapes that are used for collisions.
 *
 * @example
 *     // Create a typical dynamic body
 *     var body = new Body({
 *         mass: 1, // non-zero mass will set type to Body.DYNAMIC
 *         position: [0, 5],
 *         angle: 0,
 *         velocity: [0, 0],
 *         angularVelocity: 0
 *     });
 *
 *     // Add a circular shape to the body
 *     var circleShape = new Circle({ radius: 0.5 });
 *     body.addShape(circleShape);
 *
 *     // Add the body to the world
 *     world.addBody(body);
 *
 * @example
 *     // Create a static plane body
 *     var planeBody = new Body({
 *         mass: 0, // zero mass will set type to Body.STATIC
 *         position: [0, 0]
 *     });
 *     var planeShape = new Plane();
 *     planeBody.addShape(planeShape);
 *     world.addBody(planeBody);
 *
 * @example
 *     // Create a moving kinematic box body
 *     var platformBody = new Body({
 *         type: Body.KINEMATIC,
 *         position: [0, 3],
 *         velocity: [1, 0]
 *     });
 *     var boxShape = new Box({ width: 2, height: 0.5 });
 *     platformBody.addShape(boxShape);
 *     world.addBody(platformBody);
 */
export class Body extends EventEmitter<BodyEventMap> {
    /**
     * Dynamic body.
     */
    static DYNAMIC = 1

    /**
     * Static body.
     */
    static STATIC = 2

    /**
     * Kinematic body.
     */
    static KINEMATIC = 4

    /**
     * Awake sleep state.
     */
    static AWAKE = 0

    /**
     * Sleepy sleep state.
     */
    static SLEEPY = 1

    /**
     * Sleeping sleep state.
     */
    static SLEEPING = 2

    static _idCounter = 0

    /**
     * The body identifier. Read only!
     * @readonly
     */
    id: number

    /**
     * Index of the body in the World .bodies array. Is set to -1 if the body isn't added to a World.
     * @readonly
     */
    index: number

    /**
     * The world that this body is added to (read only). This property is set to NULL if the body is not added to any world.
     * @readonly
     */
    world: World | null = null

    /**
     * The shapes of the body.
     */
    shapes: Shape[]

    /**
     * The mass of the body. If you change this number, you should call {@link Body.updateMassProperties}.
     *
     * @example
     *     body.mass = 1;
     *     body.updateMassProperties();
     */
    mass: number

    /**
     * The inverse mass of the body.
     * @readonly
     */
    invMass: number

    /**
     * The inertia of the body around the Z axis.
     * @readonly
     */
    inertia: number

    /**
     * The inverse inertia of the body.
     * @readonly
     */
    invInertia: number

    invMassSolve: number
    invInertiaSolve: number

    /**
     * Set to true if you want to fix the rotation of the body.
     *
     * @example
     *     // Fix rotation during runtime
     *     body.fixedRotation = true;
     *     body.updateMassProperties();
     */
    fixedRotation: boolean

    /**
     * Set to true if you want to fix the body movement along the X axis. The body will still be able to move along Y.
     *
     * @example
     *     // Fix X movement on body creation
     *     var body = new Body({ mass: 1, fixedX: true });
     *
     * @example
     *     // Fix X movement during runtime
     *     body.fixedX = true;
     *     body.updateMassProperties();
     */
    fixedX: boolean

    /**
     * Set to true if you want to fix the body movement along the Y axis. The body will still be able to move along X. See .fixedX
     * @property {Boolean} fixedY
     */
    fixedY: boolean

    /**
     * The position of the body in the world. Don't use this for rendering, instead use .interpolatedPosition
     * @property position
     * @type {Array}
     */
    position: Vec2

    /**
     * The interpolated position of the body. Use this for rendering.
     * @readonly
     */
    interpolatedPosition: Vec2

    /**
     * The previous position of the body.
     */
    previousPosition: Vec2

    /**
     * The current velocity of the body.
     */
    velocity: Vec2

    /**
     * Constraint velocity that was added to the body during the last step.
     * @readonly
     */
    vlambda: Vec2

    /**
     * Angular constraint velocity that was added to the body during last step.
     * @readonly
     */
    wlambda: number

    /**
     * The angle of the body, in radians.
     *
     * @example
     *     // The angle property is not normalized to the interval 0 to 2*pi, it can be any value.
     *     // If you need a value between 0 and 2*pi, use the following function to normalize it.
     *     function normalizeAngle(angle){
     *         angle = angle % (2*Math.PI);
     *         if(angle < 0){
     *             angle += (2*Math.PI);
     *         }
     *         return angle;
     *     }
     */
    angle: number

    /**
     * The previous angle of the body.
     * @readonly
     */
    previousAngle: number

    /**
     * The interpolated angle of the body. Use this for rendering.
     * @readonly
     */
    interpolatedAngle: number

    /**
     * The angular velocity of the body, in radians per second.
     */
    angularVelocity: number

    /**
     * The force acting on the body. Since the body force (and {@link Body.angularForce}) will be zeroed after each step, so you need to set the force before each step.
     *
     * @example
     *     // This produces a forcefield of 1 Newton in the positive x direction.
     *     for(var i=0; i<numSteps; i++){
     *         body.force[0] = 1;
     *         world.step(1/60);
     *     }
     *
     * @example
     *     // This will apply a rotational force on the body
     *     for(var i=0; i<numSteps; i++){
     *         body.angularForce = -3;
     *         world.step(1/60);
     *     }
     */
    force: Vec2

    /**
     * The angular force acting on the body. See {@link Body.force}.
     * @property angularForce
     */
    angularForce: number

    /**
     * The linear damping acting on the body in the velocity direction. Should be a value between 0 and 1.
     * @default 0.1
     */
    damping: number

    /**
     * The angular force acting on the body. Should be a value between 0 and 1.
     * @default 0.1
     */
    angularDamping: number

    /**
     * The type of motion this body has. Should be one of: {@link Body.STATIC}, {@link Body.DYNAMIC} and {@link Body.KINEMATIC}.
     *
     * * Static bodies do not move, and they do not respond to forces or collision.
     * * Dynamic bodies body can move and respond to collisions and forces.
     * * Kinematic bodies only moves according to its .velocity, and does not respond to collisions or force.
     *
     * @example
     *     // Bodies are static by default. Static bodies will never move.
     *     var body = new Body();
     *     console.log(body.type == Body.STATIC); // true
     *
     * @example
     *     // By setting the mass of a body to a nonzero number, the body
     *     // will become dynamic and will move and interact with other bodies.
     *     var dynamicBody = new Body({
     *         mass : 1
     *     });
     *     console.log(dynamicBody.type == Body.DYNAMIC); // true
     *
     * @example
     *     // Kinematic bodies will only move if you change their velocity.
     *     var kinematicBody = new Body({
     *         type: Body.KINEMATIC // Type can be set via the options object.
     *     });
     */
    type: typeof Body.DYNAMIC | typeof Body.STATIC | typeof Body.KINEMATIC

    /**
     * Bounding circle radius. Update with {@link Body.updateBoundingRadius}.
     * @readonly
     */
    boundingRadius: number

    /**
     * Bounding box of this body. Update with {@link Body.updateAABB}.
     */
    aabb: AABB

    /**
     * Indicates if the AABB needs update. Update it with {@link "Body.updateAABB"}.
     *
     * @example
     *     // Force update the AABB
     *     body.aabbNeedsUpdate = true;
     *     body.updateAABB();
     *     console.log(body.aabbNeedsUpdate); // false
     */
    aabbNeedsUpdate: boolean

    /**
     * If true, the body will automatically fall to sleep. Note that you need to enable sleeping in the {@link World} before anything will happen.
     * @default true
     */
    allowSleep: boolean

    /**
     * One of {@link Body.AWAKE}, {@link Body.SLEEPY} and {@link Body.SLEEPING}.
     *
     * The body is initially Body.AWAKE. If its velocity norm is below .sleepSpeedLimit, the sleepState will become Body.SLEEPY. If the body continues to be Body.SLEEPY for .sleepTimeLimit seconds, it will fall asleep (Body.SLEEPY).
     *
     * @default Body.AWAKE
     */
    sleepState: typeof Body.AWAKE | typeof Body.SLEEPY | typeof Body.SLEEPING

    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     * @default 0.2
     */
    sleepSpeedLimit: number

    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     * @default 1
     */
    sleepTimeLimit: number

    /**
     * Whether the body wants to sleep
     * @readonly
     */
    wantsToSleep: boolean

    /**
     * The last time when the body went to SLEEPY state.
     * @readonly
     */
    timeLastSleepy: number

    /**
     * Gravity scaling factor. If you want the body to ignore gravity, set this to zero. If you want to reverse gravity, set it to -1.
     * @default 1
     */
    gravityScale: number

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this body will move through other bodies, but it will still trigger contact events, etc.
     */
    collisionResponse: boolean

    /**
     * How long the body has been sleeping.
     * @readonly
     */
    idleTime: number

    /**
     * If the body speed exceeds this threshold, CCD (continuous collision detection) will be enabled. Set it to a negative number to disable CCD completely for this body.
     * @default -1
     */
    ccdSpeedThreshold: number

    /**
     * The number of iterations that should be used when searching for the time of impact during CCD.
     * A larger number will assure that there's a small penetration on CCD collision, but a small number will give more performance.
     * @default 10
     */
    ccdIterations: number

    massMultiplier: Vec2

    islandId: number

    concavePath: Vec2[] | null

    _wakeUpAfterNarrowphase: boolean

    constructor(options: BodyOptions = {}) {
        super()

        this.id = options.id || ++Body._idCounter
        this.index = -1
        this.shapes = []

        this.mass = options.mass || 0
        this.invMass = 0

        this.inertia = 0

        this.invInertia = 0

        this.invMassSolve = 0
        this.invInertiaSolve = 0

        this.fixedRotation = !!options.fixedRotation
        this.fixedX = !!options.fixedX
        this.fixedY = !!options.fixedY

        this.massMultiplier = vec2create()

        this.position = options.position ? vec2.clone(options.position) : vec2create()
        this.interpolatedPosition = vec2.clone(this.position)
        this.previousPosition = vec2.clone(this.position)

        this.velocity = options.velocity ? vec2.clone(options.velocity) : vec2create()
        this.vlambda = vec2create()
        this.wlambda = 0

        this.angle = options.angle || 0
        this.previousAngle = this.angle
        this.interpolatedAngle = this.angle

        this.angularVelocity = options.angularVelocity || 0
        this.force = options.force ? vec2.clone(options.force) : vec2create()
        this.angularForce = options.angularForce || 0

        this.damping = options.damping !== undefined ? options.damping : 0.1
        this.angularDamping = options.angularDamping !== undefined ? options.angularDamping : 0.1

        this.type = Body.STATIC

        if (options.type !== undefined) {
            this.type = options.type
        } else if (!options.mass) {
            this.type = Body.STATIC
        } else {
            this.type = Body.DYNAMIC
        }

        this.boundingRadius = 0
        this.aabb = new AABB()
        this.aabbNeedsUpdate = true

        this.allowSleep = options.allowSleep !== undefined ? options.allowSleep : true
        this.wantsToSleep = false
        this.sleepState = Body.AWAKE
        this.sleepSpeedLimit = options.sleepSpeedLimit !== undefined ? options.sleepSpeedLimit : 0.2
        this.sleepTimeLimit = options.sleepTimeLimit !== undefined ? options.sleepTimeLimit : 1
        this.idleTime = 0
        this.timeLastSleepy = 0

        this.gravityScale = options.gravityScale !== undefined ? options.gravityScale : 1

        this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true

        this.ccdSpeedThreshold = options.ccdSpeedThreshold !== undefined ? options.ccdSpeedThreshold : -1
        this.ccdIterations = options.ccdIterations !== undefined ? options.ccdIterations : 10

        this.islandId = -1

        this.concavePath = null

        this._wakeUpAfterNarrowphase = false

        this.updateMassProperties()
    }

    updateSolveMassProperties(): void {
        if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
            this.invMassSolve = 0
            this.invInertiaSolve = 0
        } else {
            this.invMassSolve = this.invMass
            this.invInertiaSolve = this.invInertia
        }
    }

    /**
     * Set the total density of the body
     * @param density
     */
    setDensity(density: number): void {
        const totalArea = this.getArea()
        this.mass = totalArea * density
        this.updateMassProperties()
    }

    /**
     * Get the total area of all shapes in the body
     * @returns total area of all shapes in the body
     */
    getArea(): number {
        let totalArea = 0
        for (let i = 0; i < this.shapes.length; i++) {
            totalArea += this.shapes[i].area
        }
        return totalArea
    }

    /**
     * Get the AABB from the body. The AABB is updated if necessary.
     * @return The AABB instance from the body.
     */
    getAABB(): AABB {
        if (this.aabbNeedsUpdate) {
            this.updateAABB()
        }
        return this.aabb
    }

    /**
     * Updates the AABB of the Body, and set .aabbNeedsUpdate = false.
     */
    updateAABB(): void {
        const shapes = this.shapes,
            N = shapes.length,
            offset = tmp,
            bodyAngle = this.angle

        for (let i = 0; i !== N; i++) {
            const shape = shapes[i],
                angle = shape.angle + bodyAngle

            // Get shape world offset
            vec2.toGlobalFrame(offset, shape.position, this.position, bodyAngle)

            // Get shape AABB
            shape.computeAABB(shapeAABB, offset, angle)

            if (i === 0) {
                this.aabb.copy(shapeAABB)
            } else {
                this.aabb.extend(shapeAABB)
            }
        }

        this.aabbNeedsUpdate = false
    }

    /**
     * Update the bounding radius of the body (this.boundingRadius). Should be done if any of the shape dimensions or positions are changed.
     */
    updateBoundingRadius(): void {
        const shapes = this.shapes
        const N = shapes.length
        let radius = 0

        for (let i = 0; i !== N; i++) {
            const shape = shapes[i],
                offset = vec2.length(shape.position),
                r = shape.boundingRadius
            if (offset + r > radius) {
                radius = offset + r
            }
        }

        this.boundingRadius = radius
    }

    /**
     * Add a shape to the body. You can pass a local transform when adding a shape,
     * so that the shape gets an offset and angle relative to the body center of mass.
     * Will automatically update the mass properties and bounding radius.
     *
     * @method addShape
     * @param shape
     * @param offset Local body offset of the shape.
     * @param angle Local body angle.
     *
     * @example
     *     var body = new Body(),
     *         shape = new Circle({ radius: 1 });
     *
     *     // Add the shape to the body, positioned in the center
     *     body.addShape(shape);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
     *     body.addShape(shape,[1,0]);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
     *     body.addShape(shape,[0,1],Math.PI/2);
     */
    addShape(shape: Shape, offset?: Vec2, angle?: number): void {
        if (shape.body) {
            throw new Error('A shape can only be added to one body.')
        }
        const world = this.world
        if (world && world.stepping) {
            throw new Error('A shape cannot be added during step.')
        }
        shape.body = this

        // Copy the offset vector
        if (offset) {
            vec2.copy(shape.position, offset)
        } else {
            vec2.set(shape.position, 0, 0)
        }

        shape.angle = angle || 0

        this.shapes.push(shape)
        this.updateMassProperties()
        this.updateBoundingRadius()

        this.aabbNeedsUpdate = true
    }

    /**
     * Remove a shape.
     * @param shape
     * @return True if the shape was found and removed, else false.
     */
    removeShape(shape: Shape): boolean {
        const world = this.world
        if (world && world.stepping) {
            throw new Error('A shape cannot be removed during step.')
        }

        const idx = this.shapes.indexOf(shape)

        if (idx !== -1) {
            this.shapes.splice(idx, 1)
            this.aabbNeedsUpdate = true
            shape.body = null
            return true
        } else {
            return false
        }
    }

    /**
     * Updates .inertia, .invMass, .invInertia for this Body. Should be called when changing the structure or mass of the Body.
     *
     * @example
     *     body.mass += 1;
     *     body.updateMassProperties();
     */
    updateMassProperties(): void {
        if (this.type === Body.STATIC || this.type === Body.KINEMATIC) {
            this.mass = Number.MAX_VALUE
            this.invMass = 0
            this.inertia = Number.MAX_VALUE
            this.invInertia = 0
        } else {
            const shapes = this.shapes
            const N = shapes.length
            let I = 0

            if (!this.fixedRotation) {
                for (let i = 0; i < N; i++) {
                    const shape = shapes[i],
                        r2 = vec2.squaredLength(shape.position),
                        Icm = shape.computeMomentOfInertia()
                    I += Icm + r2
                }
                this.inertia = this.mass * I
                this.invInertia = I > 0 ? 1 / I : 0
            } else {
                this.inertia = Number.MAX_VALUE
                this.invInertia = 0
            }

            // Inverse mass properties are easy
            this.invMass = 1 / this.mass

            vec2.set(this.massMultiplier, this.fixedX ? 0 : 1, this.fixedY ? 0 : 1)
        }
    }

    /**
     * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
     * @param force The force vector to add, oriented in world space.
     * @param relativePoint A point relative to the body in world space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var relativePoint = [1, 0]; // Will apply the force at [body.position[0] + 1, body.position[1]]
     *     var force = [0, 1]; // up
     *     body.applyForce(force, relativePoint);
     *     console.log(body.force); // [0, 1]
     *     console.log(body.angularForce); // 1
     */
    applyForce(force: Vec2, relativePoint?: Vec2): void {
        // Add linear force
        add(this.force, this.force, force)

        if (relativePoint) {
            // Compute produced rotational force
            const rotForce = vec2.crossLength(relativePoint, force)

            // Add rotational force
            this.angularForce += rotForce
        }
    }

    /**
     * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
     * @param localForce The force vector to add, oriented in local body space.
     * @param localPoint A point relative to the body in local body space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var localPoint = [1, 0]; // x=1 locally in the body
     *     var localForce = [0, 1]; // up, locally in the body
     *     body.applyForceLocal(localForce, localPoint);
     *     console.log(body.force); // [0, 1]
     *     console.log(body.angularForce); // 1
     */

    applyForceLocal(localForce: Vec2, localPoint?: Vec2): void {
        localPoint = localPoint || Body_applyForce_pointLocal
        const worldForce = Body_applyForce_forceWorld
        const worldPoint = Body_applyForce_pointWorld
        this.vectorToWorldFrame(worldForce, localForce)
        this.vectorToWorldFrame(worldPoint, localPoint)
        this.applyForce(worldForce, worldPoint)
    }

    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface.
     * An impulse is a force added to a body during a short period of time (impulse = force * time).
     * Impulses will be added to Body.velocity and Body.angularVelocity.
     * @param impulseVector The impulse vector to add, oriented in world space.
     * @param relativePoint A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var relativePoint = [0, 0]; // center of the body
     *     var impulseVector = [0, 1]; // world up
     *     body.applyImpulse(impulseVector, relativePoint);
     */
    applyImpulse(impulseVector: Vec2, relativePoint?: Vec2): void {
        if (this.type !== Body.DYNAMIC) {
            return
        }

        // Compute produced central impulse velocity
        const velo = Body_applyImpulse_velo
        vec2.scale(velo, impulseVector, this.invMass)
        vec2.multiply(velo, this.massMultiplier, velo)

        // Add linear impulse
        add(this.velocity, velo, this.velocity)

        if (relativePoint) {
            // Compute produced rotational impulse velocity
            let rotVelo = vec2.crossLength(relativePoint, impulseVector)
            rotVelo *= this.invInertia

            // Add rotational Impulse
            this.angularVelocity += rotVelo
        }
    }

    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * @param localImpulse The impulse vector to add, oriented in local body space.
     * @param localPoint A point relative to the body in local body space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var localPoint = [1, 0]; // x=1, locally in the body
     *     var localImpulse = [0, 1]; // up, locally in the body
     *     body.applyImpulseLocal(localImpulse, localPoint);
     *     console.log(body.velocity); // [1, 0]
     *     console.log(body.angularVelocity); // 1
     */
    applyImpulseLocal(localImpulse: Vec2, localPoint?: Vec2): void {
        localPoint = localPoint || Body_applyImpulse_pointLocal
        const worldImpulse = Body_applyImpulse_impulseWorld
        const worldPoint = Body_applyImpulse_pointWorld
        this.vectorToWorldFrame(worldImpulse, localImpulse)
        this.vectorToWorldFrame(worldPoint, localPoint)
        this.applyImpulse(worldImpulse, worldPoint)
    }

    /**
     * Transform a world point to local body frame.
     * @param out The point to store the result in
     * @param worldPoint The input world point
     */
    toLocalFrame(out: Vec2, worldPoint: Vec2): void {
        vec2.toLocalFrame(out, worldPoint, this.position, this.angle)
    }

    /**
     * Transform a local point to world frame.
     * @param out The point to store the result in
     * @param localPoint The input local point
     */
    toWorldFrame(out: Vec2, localPoint: Vec2): void {
        vec2.toGlobalFrame(out, localPoint, this.position, this.angle)
    }

    /**
     * Transform a world vector to local body frame.
     * @param out The vector to store the result in
     * @param worldVector The input world vector
     */
    vectorToLocalFrame(out: Vec2, worldVector: Vec2): void {
        vec2.vectorToLocalFrame(out, worldVector, this.angle)
    }

    /**
     * Transform a local vector to world frame.
     * @param out The vector to store the result in
     * @param localVector The input local vector
     */
    vectorToWorldFrame(out: Vec2, localVector: Vec2): void {
        vec2.vectorToGlobalFrame(out, localVector, this.angle)
    }

    /**
     * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
     * @method fromPolygon
     * @param path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
     * @param options
     * @param options.optimalDecomp=false   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
     * @param options.skipSimpleCheck=false Set to true if you already know that the path is not intersecting itself.
     * @param options.removeCollinearPoints=false Set to a number (angle threshold value) to remove collinear points, or false to keep all points.
     * @return True on success, else false.
     * @example
     *     var body = new Body();
     *     var path = [
     *         [-1, 1],
     *         [-1, 0],
     *         [1, 0],
     *         [1, 1],
     *         [0.5, 0.5]
     *     ];
     *     body.fromPolygon(path);
     *     console.log(body.shapes); // [Convex, Convex, ...]
     */
    fromPolygon(
        path: Vec2[],
        options: {
            optimalDecomp?: boolean
            skipSimpleCheck?: boolean
            removeCollinearPoints?: boolean | number
        } = {}
    ): boolean {
        // Remove all shapes
        for (let i = this.shapes.length; i >= 0; --i) {
            this.removeShape(this.shapes[i])
        }

        // Copy the path
        const p = []
        for (let i = 0; i < path.length; i++) {
            p[i] = vec2.clone(path[i])
        }

        // Make it counter-clockwise
        decomp.makeCCW(p as decomp.Polygon)

        // Remove collinear points
        if (options.removeCollinearPoints !== undefined) {
            if (typeof options.removeCollinearPoints === 'boolean') {
                if (options.removeCollinearPoints === true) {
                    decomp.removeCollinearPoints(p as decomp.Polygon)
                }
            } else {
                decomp.removeCollinearPoints(p as decomp.Polygon, options.removeCollinearPoints)
            }
        }

        // Check if any line segment intersects the path itself
        if (!options.skipSimpleCheck) {
            if (!decomp.isSimple(p as decomp.Polygon)) {
                return false
            }
        }

        // Save this path for later
        const concavePath: Vec2[] = (this.concavePath = [])
        for (let i = 0; i < p.length; i++) {
            concavePath[i] = vec2.clone(p[i])
        }

        // Slow or fast decomp?
        let convexes
        if (options.optimalDecomp) {
            convexes = decomp.decomp(p as decomp.Polygon)
            if (convexes === false) {
                throw new Error('Convex decomposition failed!')
            }
        } else {
            convexes = decomp.quickDecomp(p as decomp.Polygon)
        }

        const cm = vec2create()

        // Add convexes
        for (let i = 0; i !== convexes.length; i++) {
            // Create convex
            let c = new Convex({ vertices: convexes[i] })

            // Move all vertices so its center of mass is in the local center of the convex
            for (let j = 0; j !== c.vertices.length; j++) {
                const v = c.vertices[j]
                subtract(v, v, c.centerOfMass)
            }

            vec2.copy(cm, c.centerOfMass)

            c = new Convex({ vertices: c.vertices })

            // Add the shape
            this.addShape(c, cm)
        }

        this.adjustCenterOfMass()

        this.aabbNeedsUpdate = true

        return true
    }

    /**
     * Moves the shape offsets so their center of mass becomes the body center of mass.
     *
     * @example
     *     var body = new Body({ position: [0, 0] });
     *     var shape = new Circle({ radius: 1 });
     *     body.addShape(shape, [1, 0], 0);
     *     body.adjustCenterOfMass();
     *     console.log(body.position); // [1, 0]
     *     console.log(shape.position); // [0, 0]
     */
    adjustCenterOfMass(): void {
        const offset_times_area = adjustCenterOfMass_tmp2
        const sum = adjustCenterOfMass_tmp3
        const cm = adjustCenterOfMass_tmp4
        let totalArea = 0

        vec2.set(sum, 0, 0)

        for (let i = 0; i !== this.shapes.length; i++) {
            const s = this.shapes[i]
            vec2.scale(offset_times_area, s.position, s.area)
            add(sum, sum, offset_times_area)
            totalArea += s.area
        }

        vec2.scale(cm, sum, 1 / totalArea)

        // Now move all shapes
        for (let i = 0; i !== this.shapes.length; i++) {
            const s = this.shapes[i]
            subtract(s.position, s.position, cm)
        }

        // Move the body position too
        add(this.position, this.position, cm)

        // And concave path
        for (let i = 0; this.concavePath && i < this.concavePath.length; i++) {
            subtract(this.concavePath[i], this.concavePath[i], cm)
        }

        this.updateMassProperties()
        this.updateBoundingRadius()
    }

    /**
     * Sets the force on the body to zero.
     */
    setZeroForce(): void {
        const f = this.force
        f[0] = f[1] = this.angularForce = 0
    }

    /**
     * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
     * @param dt Current time step
     */
    applyDamping(dt: number): void {
        if (this.type === Body.DYNAMIC) {
            // Only for dynamic bodies
            const v = this.velocity
            vec2.scale(v, v, Math.pow(1 - this.damping, dt))
            this.angularVelocity *= Math.pow(1 - this.angularDamping, dt)
        }
    }

    /**
     * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
     * Sets the sleepState to {@link Body.AWAKE} and emits the wakeUp event if the body wasn't awake before.
     * @method wakeUp
     */
    wakeUp(): void {
        const s = this.sleepState
        this.sleepState = Body.AWAKE
        this.idleTime = 0
        if (s !== Body.AWAKE) {
            this.emit({
                type: 'wakeup'
            } as WakeUpEvent)
        }
    }

    /**
     * Force body sleep
     */
    sleep(): void {
        this.sleepState = Body.SLEEPING
        this.angularVelocity = this.angularForce = 0
        vec2.set(this.velocity, 0, 0)
        vec2.set(this.force, 0, 0)
        this.emit({
            type: 'sleep',
        })
    }

    /**
     * Called every timestep to update internal sleep timer and change sleep state if needed.
     * @param time The world time in seconds
     * @param dontSleep
     * @param dt
     */
    sleepTick(time: number, dontSleep: boolean, dt: number): void {
        if (!this.allowSleep || this.type === Body.SLEEPING) {
            return
        }

        this.wantsToSleep = false

        const speedSquared = vec2.squaredLength(this.velocity) + Math.pow(this.angularVelocity, 2),
            speedLimitSquared = Math.pow(this.sleepSpeedLimit, 2)

        // Add to idle time
        if (speedSquared >= speedLimitSquared) {
            this.idleTime = 0
            this.sleepState = Body.AWAKE
        } else {
            this.idleTime += dt
            if (this.sleepState !== Body.SLEEPY) {
                this.sleepState = Body.SLEEPY
                this.emit({
                    type: 'sleepy'
                })
            }
        }

        if (this.idleTime > this.sleepTimeLimit) {
            if (!dontSleep) {
                this.sleep()
            } else {
                this.wantsToSleep = true
            }
        }
    }

    /**
     * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
     * @method overlaps
     * @param body
     * @return if the body overlaps the given body
     */
    overlaps(body: Body): boolean {
        if (this.world === null) {
            return false
        }
        return this.world.overlapKeeper.bodiesAreOverlapping(this, body)
    }

    /**
     * Move the body forward in time given its current velocity.
     * @param dt
     */
    integrate(dt: number): void {
        const minv = this.invMass,
            f = this.force,
            pos = this.position,
            velo = this.velocity

        // Save old position
        vec2.copy(this.previousPosition, this.position)
        this.previousAngle = this.angle

        // Velocity update
        if (!this.fixedRotation) {
            this.angularVelocity += this.angularForce * this.invInertia * dt
        }
        vec2.scale(integrate_fhMinv, f, dt * minv)
        vec2.multiply(integrate_fhMinv, this.massMultiplier, integrate_fhMinv)
        add(velo, integrate_fhMinv, velo)

        // CCD
        if (!this.integrateToTimeOfImpact(dt)) {
            // Regular position update
            vec2.scale(integrate_velodt, velo, dt)
            add(pos, pos, integrate_velodt)
            if (!this.fixedRotation) {
                this.angle += this.angularVelocity * dt
            }
        }

        this.aabbNeedsUpdate = true
    }

    /**
     * Get velocity of a point in the body.
     * @param result A vector to store the result in
     * @param relativePoint A world oriented vector, indicating the position of the point to get the velocity from
     * @return The result vector
     * 
     * @example
     *     var body = new Body({
         *         mass: 1,
         *         velocity: [1, 0],
         *         angularVelocity: 1
         *     });
         *     var result = [];
         *     var point = [1, 0];
         *     body.getVelocityAtPoint(result, point);
         *     console.log(result); // [1, 1]
         */
    getVelocityAtPoint(result: Vec2, relativePoint: Vec2): Vec2 {
        vec2.crossVZ(result, relativePoint, this.angularVelocity)
        vec2.subtract(result, this.velocity, result)
        return result
    }

    integrateToTimeOfImpact(dt: number): boolean {
        if (this.world === null) {
            throw new Error('world is not set for body')
        }

        if (this.ccdSpeedThreshold < 0 || vec2.squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)) {
            return false
        }

        // Ignore all the ignored body pairs
        // This should probably be done somewhere else for optimization
        const ignoreBodies = []
        const disabledPairs = this.world.disabledBodyCollisionPairs
        for (let i = 0; i < disabledPairs.length; i += 2) {
            const bodyA = disabledPairs[i]
            const bodyB = disabledPairs[i + 1]
            if (bodyA === this) {
                ignoreBodies.push(bodyB)
            } else if (bodyB === this) {
                ignoreBodies.push(bodyA)
            }
        }

        vec2.normalize(direction, this.velocity)

        vec2.scale(end, this.velocity, dt)
        add(end, end, this.position)

        subtract(startToEnd, end, this.position)
        const startToEndAngle = this.angularVelocity * dt
        const len = vec2.length(startToEnd)

        let timeOfImpact = 1

        let hitBody: Body | null = null
        vec2.copy(ray.from, this.position)
        vec2.copy(ray.to, end)
        ray.update()
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i]
            result.reset()
            ray.collisionGroup = shape.collisionGroup
            ray.collisionMask = shape.collisionMask
            this.world.raycast(result, ray)
            hitBody = result.body

            if (hitBody !== null && (hitBody === this || ignoreBodies.indexOf(hitBody) !== -1)) {
                hitBody = null
            }

            if (hitBody) {
                break
            }
        }

        if (!hitBody || !timeOfImpact) {
            return false
        }
        result.getHitPoint(end, ray)
        subtract(startToEnd, end, this.position)
        timeOfImpact = vec2.distance(end, this.position) / len // guess

        const rememberAngle = this.angle
        vec2.copy(rememberPosition, this.position)

        // Got a start and end point. Approximate time of impact using binary search
        let iter = 0
        let tmin = 0
        let tmid = timeOfImpact
        let tmax = 1
        while (tmax >= tmin && iter < this.ccdIterations) {
            iter++

            // calculate the midpoint
            tmid = (tmax + tmin) / 2

            // Move the body to that point
            vec2.scale(integrate_velodt, startToEnd, tmid)
            add(this.position, rememberPosition, integrate_velodt)
            this.angle = rememberAngle + startToEndAngle * tmid
            this.updateAABB()

            // check overlap
            const overlaps =
                this.aabb.overlaps(hitBody.aabb) && this.world.narrowphase.bodiesOverlap(this, hitBody, true)

            if (overlaps) {
                // change max to search lower interval
                tmax = tmid
            } else {
                // change min to search upper interval
                tmin = tmid
            }
        }

        timeOfImpact = tmax // Need to guarantee overlap to resolve collisions

        vec2.copy(this.position, rememberPosition)
        this.angle = rememberAngle

        // move to TOI
        vec2.scale(integrate_velodt, startToEnd, timeOfImpact)
        add(this.position, this.position, integrate_velodt)
        if (!this.fixedRotation) {
            this.angle += startToEndAngle * timeOfImpact
        }

        return true
    }

    resetConstraintVelocity(): void {
        const vlambda = this.vlambda
        vec2.set(vlambda, 0, 0)
        this.wlambda = 0
    }

    addConstraintVelocity(): void {
        const v = this.velocity
        add(v, v, this.vlambda)
        this.angularVelocity += this.wlambda
    }
}

const shapeAABB = new AABB()
const tmp = vec2create()

const Body_applyForce_forceWorld = vec2create()
const Body_applyForce_pointWorld = vec2create()
const Body_applyForce_pointLocal = vec2create()

const Body_applyImpulse_velo = vec2create()

const Body_applyImpulse_impulseWorld = vec2create()
const Body_applyImpulse_pointWorld = vec2create()
const Body_applyImpulse_pointLocal = vec2create()

const adjustCenterOfMass_tmp2 = vec2create()
const adjustCenterOfMass_tmp3 = vec2create()
const adjustCenterOfMass_tmp4 = vec2create()

const integrate_fhMinv = vec2create()
const integrate_velodt = vec2create()

const result = new RaycastResult()
const ray = new Ray({
    mode: Ray.CLOSEST,
    skipBackfaces: true,
})
const direction = vec2create()
const end = vec2create()
const startToEnd = vec2create()
const rememberPosition = vec2create()
