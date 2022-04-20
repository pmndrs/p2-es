import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'
import type { Vec2 } from '../types'
import type { ContactEquation } from './ContactEquation'
import { Equation } from './Equation'

/**
 * Constrains the slipping in a contact along a tangent
 */
export class FrictionEquation extends Equation {
    /**
     * Relative vector from center of body A to the contact point, world oriented.
     */
    contactPointA: Vec2

    /**
     * Relative vector from center of body B to the contact point, world oriented.
     */
    contactPointB: Vec2

    /**
     * Tangent vector that the friction force will act along. World oriented.
     */
    t: Vec2

    /**
     * ContactEquations connected to this friction equation. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
     */
    contactEquations: ContactEquation[]

    /**
     * The shape in body i that triggered this friction.
     * @todo Needed? The shape can be looked up via contactEquation.shapeA...
     */
    shapeA: Shape | null

    /**
     * The shape in body j that triggered this friction.
     * @todo Needed? The shape can be looked up via contactEquation.shapeB...
     */
    shapeB: Shape | null

    /**
     * The friction coefficient to use.
     */
    frictionCoefficient: number

    constructor(bodyA: Body, bodyB: Body, slipForce = Number.MAX_VALUE) {
        super(bodyA, bodyB, -slipForce, slipForce)
        this.contactPointA = vec2.create()
        this.contactPointB = vec2.create()
        this.t = vec2.create()
        this.contactEquations = []
        this.shapeA = null
        this.shapeB = null
        this.frictionCoefficient = 0.3
    }

    /**
     * Set the slipping condition for the constraint. The friction force cannot be larger than this value.
     * @param slipForce
     */
    setSlipForce(slipForce: number): void {
        this.maxForce = slipForce
        this.minForce = -slipForce
    }

    /**
     * Get the max force for the constraint.
     */
    getSlipForce(): number {
        return this.maxForce
    }

    computeB(a: number, b: number, h: number): number {
        const ri = this.contactPointA,
            rj = this.contactPointB,
            t = this.t,
            G = this.G

        // G = [-t -rixt t rjxt]
        // And remember, this is a pure velocity constraint, g is always zero!
        G[0] = -t[0]
        G[1] = -t[1]
        G[2] = -vec2.crossLength(ri, t)
        G[3] = t[0]
        G[4] = t[1]
        G[5] = vec2.crossLength(rj, t)

        const GW = this.computeGW()
        const GiMf = this.computeGiMf()

        const B = /* - g * a  */ -GW * b - h * GiMf

        return B
    }
}
