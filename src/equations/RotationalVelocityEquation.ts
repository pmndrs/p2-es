import type { Body } from '../objects/Body'
import { Equation } from './Equation'

/**
 * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
 */
export class RotationalVelocityEquation extends Equation {
    ratio: number

    constructor(bodyA: Body, bodyB: Body) {
        super(bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE)
        this.relativeVelocity = 1
        this.ratio = 1
    }

    computeB(a: number, b: number, h: number): number {
        const G = this.G
        G[2] = -1
        G[5] = this.ratio

        const GiMf = this.computeGiMf()
        const GW = this.computeGW()
        const B = -GW * b - h * GiMf

        return B
    }
}
