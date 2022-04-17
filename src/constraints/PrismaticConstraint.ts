import { ContactEquation } from '../equations/ContactEquation'
import { Equation } from '../equations/Equation'
import { RotationalLockEquation } from '../equations/RotationalLockEquation'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'
import type { ConstraintOptions } from './Constraint'
import { Constraint } from './Constraint'

export interface PrismaticConstraintOptions extends ConstraintOptions {
    /**
     * Max force to be applied by the constraint
     */
    maxForce?: number

    /**
     * Body A's anchor point, defined in its own local frame.
     */
    localAnchorA?: Vec2

    /**
     * Body B's anchor point, defined in its own local frame.
     */
    localAnchorB?: Vec2

    /**
     * An axis, defined in body A frame, that body B's anchor point may slide along.
     */
    localAxisA?: Vec2

    /**
     * If set to true, bodyB will be free to rotate around its anchor point.
     */
    disableRotationalLock?: boolean
    upperLimit?: number
    lowerLimit?: number
}

/**
 * Constraint that only allows bodies to move along a line, relative to each other.
 * See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>. Also called "slider constraint".
 *
 * @todo Ability to create using only a point and a worldAxis
 *
 * @example
 *     var constraint = new PrismaticConstraint(bodyA, bodyB, {
 *         localAxisA: [0, 1]
 *     });
 *     world.addConstraint(constraint);
 */
export class PrismaticConstraint extends Constraint {
    localAnchorA: Vec2
    localAnchorB: Vec2
    localAxisA: Vec2

    /**
     * The position of anchor A relative to anchor B, along the constraint axis.
     */
    position: number
    velocity: number

    /**
     * Set to true to enable lower limit.
     */
    lowerLimitEnabled: boolean

    /**
     * Set to true to enable upper limit.
     */
    upperLimitEnabled: boolean

    /**
     * Lower constraint limit. The constraint position is forced to be larger than this value.
     */
    lowerLimit: number

    /**
     * Upper constraint limit. The constraint position is forced to be smaller than this value.
     */
    upperLimit: number
    upperLimitEquation: ContactEquation
    lowerLimitEquation: ContactEquation

    /**
     * Equation used for the motor.
     */
    motorEquation: Equation

    /**
     * The current motor state. Enable or disable the motor using .enableMotor
     */
    motorEnabled: boolean

    /**
     * Set the target speed for the motor.
     */
    motorSpeed: number
    maxForce: number

    constructor(bodyA: Body, bodyB: Body, options?: PrismaticConstraintOptions) {
        options = options || {}
        super(bodyA, bodyB, Constraint.PRISMATIC, options)

        // Get anchors
        const localAnchorA = vec2.create(),
            localAxisA = vec2.fromValues(1, 0),
            localAnchorB = vec2.create()
        if (options.localAnchorA) {
            vec2.copy(localAnchorA, options.localAnchorA)
        }
        if (options.localAxisA) {
            vec2.copy(localAxisA, options.localAxisA)
        }
        if (options.localAnchorB) {
            vec2.copy(localAnchorB, options.localAnchorB)
        }

        this.localAnchorA = localAnchorA
        this.localAnchorB = localAnchorB
        this.localAxisA = localAxisA

        /*

    The constraint violation for the common axis point is

        g = ( xj + rj - xi - ri ) * t   :=  gg*t

    where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

        gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

    Note the use of the chain rule. Now we identify the jacobian

        G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

    The rotational part is just a rotation lock.

     */

        const maxForce = (this.maxForce = options.maxForce !== undefined ? options.maxForce : Number.MAX_VALUE)

        // Translational part
        const trans = new Equation(bodyA, bodyB, -maxForce, maxForce)
        const ri = vec2.create(),
            rj = vec2.create(),
            gg = vec2.create(),
            t = vec2.create()

        trans.computeGq = function () {
            // g = ( xj + rj - xi - ri ) * t
            return vec2.dot(gg, t)
        }

        // @ts-expect-error untyped
        trans.updateJacobian = function () {
            const G = this.G,
                xi = bodyA.position,
                xj = bodyB.position
            vec2.rotate(ri, localAnchorA, bodyA.angle)
            vec2.rotate(rj, localAnchorB, bodyB.angle)
            vec2.add(gg, xj, rj)
            vec2.subtract(gg, gg, xi)
            vec2.subtract(gg, gg, ri)
            vec2.rotate(t, localAxisA, bodyA.angle + Math.PI / 2)

            G[0] = -t[0]
            G[1] = -t[1]
            G[2] = -vec2.crossLength(ri, t) + vec2.crossLength(t, gg)
            G[3] = t[0]
            G[4] = t[1]
            G[5] = vec2.crossLength(rj, t)
        }
        this.equations.push(trans)

        // Rotational part
        if (!options.disableRotationalLock) {
            const rot = new RotationalLockEquation(bodyA, bodyB) // todo - was `-maxForce,maxForce`
            this.equations.push(rot)
        }

        this.position = 0

        // Is this one used at all?
        this.velocity = 0

        this.lowerLimitEnabled = options.lowerLimit !== undefined ? true : false
        this.upperLimitEnabled = options.upperLimit !== undefined ? true : false

        this.lowerLimit = options.lowerLimit !== undefined ? options.lowerLimit : 0
        this.upperLimit = options.upperLimit !== undefined ? options.upperLimit : 1

        // Equations used for limits
        this.upperLimitEquation = new ContactEquation(bodyA, bodyB)
        this.lowerLimitEquation = new ContactEquation(bodyA, bodyB)

        // Set max/min forces
        this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0
        this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce

        this.motorEquation = new Equation(bodyA, bodyB, 0, 0) // todo - min, max was not given
        this.motorEnabled = false
        this.motorSpeed = 0

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this
        const motorEquation = this.motorEquation
        motorEquation.computeGq = function () {
            return 0
        }
        motorEquation.computeGW = function () {
            const G = this.G,
                bi = this.bodyA,
                bj = this.bodyB,
                vi = bi.velocity,
                vj = bj.velocity,
                wi = bi.angularVelocity,
                wj = bj.angularVelocity
            return this.gmult(G, vi, wi, vj, wj) + that.motorSpeed
        }
    }

    /**
     * Enable the motor
     */
    enableMotor(): void {
        if (this.motorEnabled) {
            return
        }
        this.equations.push(this.motorEquation)
        this.motorEnabled = true
    }

    /**
     * Disable the rotational motor
     */
    disableMotor(): void {
        if (!this.motorEnabled) {
            return
        }
        const i = this.equations.indexOf(this.motorEquation)
        this.equations.splice(i, 1)
        this.motorEnabled = false
    }

    /**
     * Set the constraint limits.
     * @param lower lower limit
     * @param upper upper limit
     */
    setLimits(lower: number, upper: number): void {
        if (typeof lower === 'number') {
            this.lowerLimit = lower
            this.lowerLimitEnabled = true
        } else {
            this.lowerLimit = lower
            this.lowerLimitEnabled = false
        }

        if (typeof upper === 'number') {
            this.upperLimit = upper
            this.upperLimitEnabled = true
        } else {
            this.upperLimit = upper
            this.upperLimitEnabled = false
        }
    }

    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     */
    update(): void {
        const eqs = this.equations,
            trans = eqs[0],
            upperLimit = this.upperLimit,
            lowerLimit = this.lowerLimit,
            upperLimitEquation = this.upperLimitEquation,
            lowerLimitEquation = this.lowerLimitEquation,
            bodyA = this.bodyA,
            bodyB = this.bodyB,
            localAxisA = this.localAxisA,
            localAnchorA = this.localAnchorA,
            localAnchorB = this.localAnchorB

        // @ts-expect-error untyped method set in constructor
        trans.updateJacobian()

        // Transform local things to world
        vec2.rotate(worldAxisA, localAxisA, bodyA.angle)
        vec2.rotate(orientedAnchorA, localAnchorA, bodyA.angle)
        vec2.add(worldAnchorA, orientedAnchorA, bodyA.position)
        vec2.rotate(orientedAnchorB, localAnchorB, bodyB.angle)
        vec2.add(worldAnchorB, orientedAnchorB, bodyB.position)

        const relPosition = (this.position = vec2.dot(worldAnchorB, worldAxisA) - vec2.dot(worldAnchorA, worldAxisA))

        // Motor
        if (this.motorEnabled) {
            // G = [ a     a x ri   -a   -a x rj ]
            const G = this.motorEquation.G
            G[0] = worldAxisA[0]
            G[1] = worldAxisA[1]
            G[2] = vec2.crossLength(worldAxisA, orientedAnchorB)
            G[3] = -worldAxisA[0]
            G[4] = -worldAxisA[1]
            G[5] = -vec2.crossLength(worldAxisA, orientedAnchorA)
        }

        /*
            Limits strategy:
            Add contact equation, with normal along the constraint axis.
            min/maxForce is set so the constraint is repulsive in the correct direction.
            Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

                    ^
                    |
        upperLimit x
                    |    ------
            anchorB x<---|  B |
                    |    |    |
            ------   |    ------
            |    |   |
            |  A |-->x anchorA
            ------   |
                    x lowerLimit
                    |
                    axis
        */

        if (this.upperLimitEnabled && relPosition > upperLimit) {
            // Update contact constraint normal, etc
            vec2.scale(upperLimitEquation.normalA, worldAxisA, -1)
            vec2.subtract(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position)
            vec2.subtract(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position)
            vec2.scale(tmp, worldAxisA, upperLimit)
            vec2.add(upperLimitEquation.contactPointA, upperLimitEquation.contactPointA, tmp)
            if (eqs.indexOf(upperLimitEquation) === -1) {
                eqs.push(upperLimitEquation)
            }
        } else {
            const idx = eqs.indexOf(upperLimitEquation)
            if (idx !== -1) {
                eqs.splice(idx, 1)
            }
        }

        if (this.lowerLimitEnabled && relPosition < lowerLimit) {
            // Update contact constraint normal, etc
            vec2.scale(lowerLimitEquation.normalA, worldAxisA, 1)
            vec2.subtract(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position)
            vec2.subtract(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position)
            vec2.scale(tmp, worldAxisA, lowerLimit)
            vec2.subtract(lowerLimitEquation.contactPointB, lowerLimitEquation.contactPointB, tmp)
            if (eqs.indexOf(lowerLimitEquation) === -1) {
                eqs.push(lowerLimitEquation)
            }
        } else {
            const idx = eqs.indexOf(lowerLimitEquation)
            if (idx !== -1) {
                eqs.splice(idx, 1)
            }
        }
    }
}

const worldAxisA = vec2.create(),
    worldAnchorA = vec2.create(),
    worldAnchorB = vec2.create(),
    orientedAnchorA = vec2.create(),
    orientedAnchorB = vec2.create(),
    tmp = vec2.create()
