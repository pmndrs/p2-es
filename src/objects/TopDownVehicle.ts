import { Constraint } from '../constraints/Constraint'
import { FrictionEquation } from '../equations/FrictionEquation'
import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { World } from '../world/World'
import { Body } from './Body'

export interface WheelConstraintOptions {
    /**
     * The local wheel forward vector in local body space. Default is zero.
     */
    localForwardVector?: Vec2

    /**
     * The local position of the wheen in the chassis body. Default is zero - the center of the body.
     */
    localPosition?: Vec2

    /**
     * The max friction force in the sideways direction.
     */
    sideFriction?: number
}

/**
 * WheelConstraint
 */
export class WheelConstraint extends Constraint {
    protected vehicle: TopDownVehicle
    protected forwardEquation: FrictionEquation
    protected sideEquation: FrictionEquation

    steerValue: number
    engineForce: number
    localForwardVector: Vec2
    localPosition: Vec2

    constructor(vehicle: TopDownVehicle, options: WheelConstraintOptions = {}) {
        super(vehicle.chassisBody, vehicle.groundBody, Constraint.OTHER)

        this.vehicle = vehicle

        this.forwardEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody, 0)

        this.sideEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody, 0)

        this.steerValue = 0

        this.engineForce = 0

        this.setSideFriction(options.sideFriction ?? 5)

        this.localForwardVector = vec2.fromValues(0, 1)
        if (options.localForwardVector) {
            vec2.copy(this.localForwardVector, options.localForwardVector)
        }

        this.localPosition = vec2.create()
        if (options.localPosition) {
            vec2.copy(this.localPosition, options.localPosition)
        }

        this.equations.push(this.forwardEquation, this.sideEquation)

        this.setBrakeForce(0)
    }

    setBrakeForce(force: number): void {
        this.forwardEquation.setSlipForce(force)
    }

    setSideFriction(force: number): void {
        this.sideEquation.setSlipForce(force)
    }

    getSpeed(): number {
        const body = this.vehicle.chassisBody
        body.vectorToWorldFrame(relativePoint, this.localForwardVector)
        body.getVelocityAtPoint(worldVelocity, relativePoint)
        return vec2.dot(worldVelocity, relativePoint)
    }

    update(): void {
        const body = this.vehicle.chassisBody
        const forwardEquation = this.forwardEquation
        const sideEquation = this.sideEquation
        const steerValue = this.steerValue

        // Directional
        body.vectorToWorldFrame(forwardEquation.t, this.localForwardVector)
        vec2.rotate(sideEquation.t, this.localForwardVector, Math.PI / 2)
        body.vectorToWorldFrame(sideEquation.t, sideEquation.t)

        vec2.rotate(forwardEquation.t, forwardEquation.t, steerValue)
        vec2.rotate(sideEquation.t, sideEquation.t, steerValue)

        // Attachment point
        body.toWorldFrame(forwardEquation.contactPointB, this.localPosition)
        vec2.copy(sideEquation.contactPointB, forwardEquation.contactPointB)

        body.vectorToWorldFrame(forwardEquation.contactPointA, this.localPosition)
        vec2.copy(sideEquation.contactPointA, forwardEquation.contactPointA)

        // Add engine force
        vec2.normalize(tmpVec, forwardEquation.t)
        vec2.scale(tmpVec, tmpVec, this.engineForce)

        this.vehicle.chassisBody.applyForce(tmpVec, forwardEquation.contactPointA)
    }
}

/**
 * TopDownVehicle
 *
 * @deprecated This class will be moved out of the core library in future versions.
 *
 * @example
 *
 *     // Create a dynamic body for the chassis
 *     var chassisBody = new Body({
 *         mass: 1
 *     });
 *     var boxShape = new Box({ width: 0.5, height: 1 });
 *     chassisBody.addShape(boxShape);
 *     world.addBody(chassisBody);
 *
 *     // Create the vehicle
 *     var vehicle = new TopDownVehicle(chassisBody);
 *
 *     // Add one front wheel and one back wheel - we don't actually need four :)
 *     var frontWheel = vehicle.addWheel({
 *         localPosition: [0, 0.5] // front
 *     });
 *     frontWheel.setSideFriction(4);
 *
 *     // Back wheel
 *     var backWheel = vehicle.addWheel({
 *         localPosition: [0, -0.5] // back
 *     });
 *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
 *     vehicle.addToWorld(world);
 *
 *     // Steer value zero means straight forward. Positive is left and negative right.
 *     frontWheel.steerValue = Math.PI / 16;
 *
 *     // Engine force forward
 *     backWheel.engineForce = 10;
 *     backWheel.setBrakeForce(0);
 */
export class TopDownVehicle {
    chassisBody: Body
    groundBody: Body
    wheels: WheelConstraint[]
    world: World | null

    postStepCallback: () => void

    constructor(chassisBody: Body) {
        this.chassisBody = chassisBody
        this.wheels = []

        // A dummy body to constrain the chassis to
        this.groundBody = new Body({ mass: 0 })

        this.world = null

        this.postStepCallback = () => {
            this.update()
        }
    }

    addToWorld(world: World): void {
        this.world = world
        world.addBody(this.groundBody)
        world.on('postStep', this.postStepCallback)
        for (let i = 0; i < this.wheels.length; i++) {
            const wheel = this.wheels[i]
            world.addConstraint(wheel)
        }
    }

    removeFromWorld(): void {
        if (this.world === null) {
            return
        }

        this.world.removeBody(this.groundBody)
        this.world.off('postStep', this.postStepCallback)
        for (let i = 0; i < this.wheels.length; i++) {
            const wheel = this.wheels[i]
            this.world.removeConstraint(wheel)
        }
        this.world = null
    }

    addWheel(wheelOptions?: WheelConstraintOptions): WheelConstraint {
        const wheel = new WheelConstraint(this, wheelOptions)
        this.wheels.push(wheel)
        return wheel
    }

    update(): void {
        for (let i = 0; i < this.wheels.length; i++) {
            this.wheels[i].update()
        }
    }
}
const worldVelocity = vec2.create()
const relativePoint = vec2.create()
const tmpVec = vec2.create()
