import { Equation } from '../equations/Equation'
import { RotationalLockEquation } from '../equations/RotationalLockEquation'
import { RotationalVelocityEquation } from '../equations/RotationalVelocityEquation'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'
import type { ConstraintOptions } from './Constraint'
import { Constraint } from './Constraint'

export interface RevoluteConstraintOptions extends ConstraintOptions {
    /**
     * A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
     */
    worldPivot?: Vec2

    /**
     * The point relative to the center of mass of bodyA which bodyA is constrained to.
     */
    localPivotA?: Vec2

    /**
     * See localPivotA.
     */
    localPivotB?: Vec2

    /**
     * The maximum force that should be applied to constrain the bodies.
     */
    maxForce?: number
}

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 *
 * @example
 *     // This will create a revolute constraint between two bodies with pivot point in between them.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     world.addBody(bodyA);
 *
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     world.addBody(bodyB);
 *
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
 *     world.addConstraint(constraint);
 *
 *     // Using body-local pivot points, the constraint could have been constructed like this:
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
 */
export class RevoluteConstraint extends Constraint {
    /**
     * The constraint position.
     */
    angle: number

    /**
     * Set to true to enable lower limit
     */
    lowerLimitEnabled: boolean

    /**
     * Set to true to enable upper limit
     */
    upperLimitEnabled: boolean

    /**
     * The lower limit on the constraint angle.
     */
    lowerLimit: number

    /**
     * The upper limit on the constraint angle.
     */
    upperLimit: number

    get motorEnabled(): boolean {
        return this.motorEquation.enabled
    }

    set motorEnabled(value: boolean) {
        this.motorEquation.enabled = value
    }

    get motorSpeed(): number {
        return this.motorEquation.relativeVelocity
    }

    set motorSpeed(value: number) {
        this.motorEquation.relativeVelocity = value
    }

    get motorMaxForce(): number {
        return this.motorEquation.maxForce
    }

    set motorMaxForce(value: number) {
        const eq = this.motorEquation
        eq.maxForce = value
        eq.minForce = -value
    }

    maxForce: number

    pivotA: Vec2

    pivotB: Vec2

    motorEquation: RotationalVelocityEquation

    upperLimitEquation: RotationalLockEquation

    lowerLimitEquation: RotationalLockEquation

    constructor(bodyA: Body, bodyB: Body, options?: RevoluteConstraintOptions) {
        options = options || {}
        super(bodyA, bodyB, Constraint.REVOLUTE, options)

        const maxForce = (this.maxForce = options.maxForce !== undefined ? options.maxForce : Number.MAX_VALUE)

        const pivotA = (this.pivotA = vec2.create())
        const pivotB = (this.pivotB = vec2.create())

        if (options.worldPivot) {
            // Compute pivotA and pivotB
            vec2.subtract(pivotA, options.worldPivot, bodyA.position)
            vec2.subtract(pivotB, options.worldPivot, bodyB.position)
            // Rotate to local coordinate system
            vec2.rotate(pivotA, pivotA, -bodyA.angle)
            vec2.rotate(pivotB, pivotB, -bodyB.angle)
        } else {
            // Get pivotA and pivotB
            if (options.localPivotA) {
                vec2.copy(pivotA, options.localPivotA)
            }
            if (options.localPivotB) {
                vec2.copy(pivotB, options.localPivotB)
            }
        }

        const motorEquation = (this.motorEquation = new RotationalVelocityEquation(bodyA, bodyB))
        motorEquation.enabled = false

        const upperLimitEquation = (this.upperLimitEquation = new RotationalLockEquation(bodyA, bodyB))
        const lowerLimitEquation = (this.lowerLimitEquation = new RotationalLockEquation(bodyA, bodyB))
        upperLimitEquation.minForce = lowerLimitEquation.maxForce = 0

        // Equations to be fed to the solver
        const eqs = (this.equations = [
            new Equation(bodyA, bodyB, -maxForce, maxForce),
            new Equation(bodyA, bodyB, -maxForce, maxForce),
            motorEquation,
            upperLimitEquation,
            lowerLimitEquation,
        ])

        const x = eqs[0]
        const y = eqs[1]

        x.computeGq = function () {
            vec2.rotate(worldPivotA, pivotA, bodyA.angle)
            vec2.rotate(worldPivotB, pivotB, bodyB.angle)
            vec2.add(g, bodyB.position, worldPivotB)
            vec2.subtract(g, g, bodyA.position)
            vec2.subtract(g, g, worldPivotA)
            return vec2.dot(g, xAxis)
        }

        y.computeGq = function () {
            vec2.rotate(worldPivotA, pivotA, bodyA.angle)
            vec2.rotate(worldPivotB, pivotB, bodyB.angle)
            vec2.add(g, bodyB.position, worldPivotB)
            vec2.subtract(g, g, bodyA.position)
            vec2.subtract(g, g, worldPivotA)
            return vec2.dot(g, yAxis)
        }

        y.minForce = x.minForce = -maxForce
        y.maxForce = x.maxForce = maxForce

        // These never change but the angular parts do
        x.G[0] = -1
        x.G[1] = 0

        x.G[3] = 1
        x.G[4] = 0

        y.G[0] = 0
        y.G[1] = -1

        y.G[3] = 0
        y.G[4] = 1

        this.angle = 0

        this.lowerLimitEnabled = false
        this.upperLimitEnabled = false
        this.lowerLimit = 0
        this.upperLimit = 0
    }

    /**
     * Set the constraint angle limits, and enable them.
     * @param lower the lower limit
     * @param upper the upper limit
     */
    setLimits(lower: number, upper: number): void {
        this.lowerLimit = lower
        this.upperLimit = upper
        this.lowerLimitEnabled = this.upperLimitEnabled = true
    }

    update(): void {
        const bodyA = this.bodyA,
            bodyB = this.bodyB,
            pivotA = this.pivotA,
            pivotB = this.pivotB,
            eqs = this.equations,
            x = eqs[0],
            y = eqs[1],
            upperLimit = this.upperLimit,
            lowerLimit = this.lowerLimit,
            upperLimitEquation = this.upperLimitEquation,
            lowerLimitEquation = this.lowerLimitEquation

        const relAngle = (this.angle = bodyB.angle - bodyA.angle)

        upperLimitEquation.angle = upperLimit
        upperLimitEquation.enabled = this.upperLimitEnabled && relAngle > upperLimit

        lowerLimitEquation.angle = lowerLimit
        lowerLimitEquation.enabled = this.lowerLimitEnabled && relAngle < lowerLimit

        /*

    The constraint violation is

        g = xj + rj - xi - ri

    ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

        gdot = vj + wj x rj - vi - wi x ri

    We split this into x and y directions. (let x and y be unit vectors along the respective axes)

        gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                 = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                 = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                 = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                 = G*W

    ...and similar for y. We have then identified the jacobian entries for x and y directions:

        Gx = [ x   (rj x x)   -x   -(ri x x)]
        Gy = [ y   (rj x y)   -y   -(ri x y)]

    So for example, in the X direction we would get in 2 dimensions

        G = [ [1   0   (rj x [1,0])   -1   0   -(ri x [1,0])]
              [0   1   (rj x [0,1])    0  -1   -(ri x [0,1])]
     */

        vec2.rotate(worldPivotA, pivotA, bodyA.angle)
        vec2.rotate(worldPivotB, pivotB, bodyB.angle)

        // @todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

        const xG = x.G
        xG[2] = -vec2.crossLength(worldPivotA, xAxis)
        xG[5] = vec2.crossLength(worldPivotB, xAxis)

        const yG = y.G
        yG[2] = -vec2.crossLength(worldPivotA, yAxis)
        yG[5] = vec2.crossLength(worldPivotB, yAxis)
    }

    /**
     * Enable the rotational motor
     * @deprecated Use motorEnabled instead
     */
    enableMotor(): void {
        console.warn('revolute.enableMotor() is deprecated, do revolute.motorEnabled = true; instead.')
        this.motorEnabled = true
    }

    /**
     * Disable the rotational motor
     * @deprecated Use motorEnabled instead
     */
    disableMotor(): void {
        console.warn('revolute.disableMotor() is deprecated, do revolute.motorEnabled = false; instead.')
        this.motorEnabled = false
    }

    /**
     * Check if the motor is enabled.
     * @deprecated Use motorEnabled instead
     * @returns
     */
    motorIsEnabled(): boolean {
        console.warn('revolute.motorIsEnabled() is deprecated, use revolute.motorEnabled instead.')
        return this.motorEnabled
    }

    /**
     * Set the speed of the rotational constraint motor
     * @deprecated Use .motorSpeed instead
     * @param speed
     */
    setMotorSpeed(speed: number): void {
        console.warn('revolute.setMotorSpeed(speed) is deprecated, do revolute.motorSpeed = speed; instead.')
        this.motorSpeed = speed
    }

    /**
     * Get the speed of the rotational constraint motor
     * @deprecated Use .motorSpeed instead
     * @returns
     */
    getMotorSpeed(): number {
        console.warn('revolute.getMotorSpeed() is deprecated, use revolute.motorSpeed instead.')
        return this.motorSpeed
    }
}

const worldPivotA = vec2.create(),
    worldPivotB = vec2.create(),
    xAxis = vec2.fromValues(1, 0),
    yAxis = vec2.fromValues(0, 1),
    g = vec2.create()
