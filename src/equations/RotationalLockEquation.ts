import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import { Equation } from './Equation'

const worldVectorA = vec2.create()
const worldVectorB = vec2.create()
const xAxis = vec2.fromValues(1, 0)
const yAxis = vec2.fromValues(0, 1)

export interface RotationalLockEquationOptions {
    angle?: number | undefined
}

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 */
export class RotationalLockEquation extends Equation {
    angle: number

    constructor(bodyA: Body, bodyB: Body, options?: RotationalLockEquationOptions) {
        options = options || {}
        super(bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE)

        /**
         * @property {number} angle
         */
        this.angle = options.angle || 0

        const G = this.G
        G[2] = 1
        G[5] = -1
    }

    computeGq(): number {
        vec2.rotate(worldVectorA, xAxis, this.bodyA.angle + this.angle)
        vec2.rotate(worldVectorB, yAxis, this.bodyB.angle)
        return vec2.dot(worldVectorA, worldVectorB)
    }
}
