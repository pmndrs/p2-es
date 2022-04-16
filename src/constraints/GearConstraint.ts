import type { AngleLockEquationOptions } from '../equations/AngleLockEquation'
import { AngleLockEquation } from '../equations/AngleLockEquation'
import type { Body } from '../objects/Body'
import { Utils } from '../utils/Utils'
import type { ConstraintOptions } from './Constraint'
import { Constraint } from './Constraint'

export interface GearConstraintOptions extends ConstraintOptions {
    /**
     * Relative angle between the bodies. Will be set to the current angle between the bodies (the gear ratio is accounted for).
     */
    angle?: number

    /**
     * Gear ratio.
     */
    ratio?: number
    
    /**
     * Maximum torque to apply.
     */
    maxTorque?: number
}

/**
 * Constrains the angle of two bodies to each other to be equal. If a gear ratio is not one, the angle of bodyA must be a multiple of the angle of bodyB.
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB, {
 *         ratio: 2,
 *         maxTorque: 1000
 *     });
 *     world.addConstraint(constraint);
 */
export class GearConstraint extends Constraint {
    ratio: number

    angle: number

    constructor(bodyA: Body, bodyB: Body, options?: GearConstraintOptions) {
        options = options || {}

        super(bodyA, bodyB, Constraint.GEAR, options)

        /**
         * The gear ratio.
         * @property ratio
         * @type {Number}
         */
        this.ratio = options.ratio !== undefined ? options.ratio : 1

        /**
         * The relative angle
         * @property angle
         * @type {Number}
         */
        this.angle = options.angle !== undefined ? options.angle : bodyB.angle - this.ratio * bodyA.angle

        // Send same parameters to the equation
        const angleLockOptions: AngleLockEquationOptions = Utils.shallowClone(options)
        angleLockOptions.angle = this.angle
        angleLockOptions.ratio = this.ratio

        this.equations = [new AngleLockEquation(bodyA, bodyB, angleLockOptions)]

        // Set max torque
        if (options.maxTorque !== undefined) {
            this.setMaxTorque(options.maxTorque)
        }
    }

    /**
     * Set the max torque for the constraint.
     * @param torque 
     */
    setMaxTorque(torque: number): void {
        (this.equations[0] as AngleLockEquation).setMaxTorque(torque)
    }
    
    /**
     * Get the max torque for the constraint.
     * @returns 
     */
    getMaxTorque(): number {
        return this.equations[0].maxForce
    }

    update(): void {
        const eq = this.equations[0] as AngleLockEquation
        const ratio = this.ratio
        if (eq.ratio !== ratio) {
            eq.setRatio(ratio)
        }
        eq.angle = this.angle
    }
}
