import type { Body } from '../objects/Body'
import type { SpringOptions } from './Spring'
import { Spring } from './Spring'

export interface RotationalSpringOptions extends SpringOptions {
    /**
     * Rest angle of the spring.
     */
    restAngle?: number
}

/**
 * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
 *
 * The spring can be combined with a {@link RevoluteConstraint} to make, for example, a mouse trap.
 *
 * @example
 *     var spring = new RotationalSpring(bodyA, bodyB, {
 *         stiffness: 100,
 *         damping: 1
 *     });
 *     world.addSpring(spring);
 */
export class RotationalSpring extends Spring {
    /**
     * Rest angle of the spring.
     */
    restAngle: number

    constructor(bodyA: Body, bodyB: Body, options: RotationalSpringOptions = {}) {
        super(bodyA, bodyB, options)
        this.restAngle = options.restAngle ?? bodyB.angle - bodyA.angle
    }

    /**
     * Apply the spring force to the connected bodies.
     */
    applyForce(): void {
        const k = this.stiffness,
            d = this.damping,
            l = this.restAngle,
            bodyA = this.bodyA,
            bodyB = this.bodyB,
            x = bodyB.angle - bodyA.angle,
            u = bodyB.angularVelocity - bodyA.angularVelocity

        const torque = -k * (x - l) - d * u

        bodyA.angularForce -= torque
        bodyB.angularForce += torque
    }
}
