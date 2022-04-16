import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'

export interface SpringOptions {
    stiffness?: number
    damping?: number
    localAnchorA?: Vec2
    localAnchorB?: Vec2
    worldAnchorA?: Vec2
    worldAnchorB?: Vec2
}

/**
 * Base class for {{#crossLink "LinearSpring"}}{{/crossLink}} and {{#crossLink "RotationalSpring"}}{{/crossLink}}. Not supposed to be used directly.
 */
export abstract class Spring {
    /**
     * Stiffness of the spring.
     */
    stiffness: number

    /**
     * Damping of the spring.
     */
    damping: number

    /**
     * First connected body.
     */
    bodyA: Body

    /**
     * Second connected body.
     */
    bodyB: Body

    constructor(bodyA: Body, bodyB: Body, options?: SpringOptions) {
        options = options || {}

        this.stiffness = options.stiffness !== undefined ? options.stiffness : 100
        this.damping = options.damping !== undefined ? options.damping : 1
        this.bodyA = bodyA
        this.bodyB = bodyB
    }

    /**
     * Apply the spring force to the connected bodies. Called automatically by the World.
     */
    abstract applyForce(): void
}
