import { create as createVec2, multiply, scale } from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'
import { Utils } from '../utils/Utils'

const qi = createVec2()
const qj = createVec2()
const iMfi = createVec2()
const iMfj = createVec2()

function addToVLambda(
    vlambda: Vec2,
    Gx: number,
    Gy: number,
    invMass: number,
    deltalambda: number,
    massMultiplier: Vec2
) {
    vlambda[0] += Gx * invMass * deltalambda * massMultiplier[0]
    vlambda[1] += Gy * invMass * deltalambda * massMultiplier[1]
}

/**
 * Base class for constraint equations.
 */
export class Equation {
    /**
     * The default stiffness when creating a new Equation.
     */
    static DEFAULT_STIFFNESS = 1e6

    /**
     * The default relaxation when creating a new Equation.
     */
    static DEFAULT_RELAXATION = 4

    /**
     * Whether this equation is enabled or not. If true, it will be added to the solver.
     */
    enabled: boolean

    /**
     * Minimum force to apply when solving.
     */
    minForce: number

    /**
     * Max force to apply when solving.
     */
    maxForce: number

    /**
     * Cap the constraint violation (G*q) to this value.
     */
    maxBias: number

    /**
     * First body participating in the constraint
     */
    bodyA: Body

    /**
     * Second body participating in the constraint
     */
    bodyB: Body

    /**
     * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
     */
    stiffness: number

    /**
     * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
     */
    relaxation: number

    /**
     * The Jacobian entry of this equation. 6 numbers, 3 per body (x,y,angle).
     */
    G: Vec2

    /**
     * Indicates if stiffness or relaxation was changed.
     */
    needsUpdate: boolean

    /**
     * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
     */
    multiplier: number

    /**
     * Relative velocity.
     */
    relativeVelocity: number

    epsilon: number
    timeStep: number
    offset: number
    invC: number
    a: number
    b: number
    B: number
    lambda: number
    index: number
    minForceDt: number
    maxForceDt: number

    /**
     * Constructor for an Equation
     * @param bodyA  * @param {Body} bodyA First body participating in the equation
     * @param {Body} bodyB Second body participating in the equation
     * @param {number} minForce Minimum force to apply. Default: -Number.MAX_VALUE
     * @param {number} maxForce Maximum force to apply. Default: Number.MAX_VALUE
     * @param bodyB
     * @param minForce
     * @param maxForce
     */
    constructor(bodyA: Body, bodyB: Body, minForce: number, maxForce: number) {
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.minForce = minForce === undefined ? -Number.MAX_VALUE : minForce
        this.maxForce = maxForce === undefined ? Number.MAX_VALUE : maxForce
        this.maxBias = Number.MAX_VALUE
        this.stiffness = Equation.DEFAULT_STIFFNESS
        this.relaxation = Equation.DEFAULT_RELAXATION

        this.G = new Utils.ARRAY_TYPE(6)
        for (let i = 0; i < 6; i++) {
            this.G[i] = 0
        }

        this.offset = 0
        this.a = 0
        this.b = 0
        this.epsilon = 0
        this.timeStep = 1 / 60
        this.needsUpdate = true
        this.multiplier = 0
        this.relativeVelocity = 0
        this.enabled = true

        // Temp stuff
        this.lambda = this.B = this.invC = this.minForceDt = this.maxForceDt = 0
        this.index = -1
    }

    update(): void {
        const k = this.stiffness,
            d = this.relaxation,
            h = this.timeStep

        this.a = 4 / (h * (1 + 4 * d))
        this.b = (4 * d) / (1 + 4 * d)
        this.epsilon = 4 / (h * h * k * (1 + 4 * d))

        this.needsUpdate = false
    }

    /**
     * Multiply a jacobian entry with corresponding positions or velocities
     */
    gmult(G: Vec2, vi: Vec2, wi: number, vj: Vec2, wj: number): number {
        return G[0] * vi[0] + G[1] * vi[1] + G[2] * wi + G[3] * vj[0] + G[4] * vj[1] + G[5] * wj
    }

    /**
     * Computes the RHS of the SPOOK equation
     */
    computeB(a: number, b: number, h: number): number {
        const GW = this.computeGW()
        let Gq = this.computeGq()
        const maxBias = this.maxBias
        if (Math.abs(Gq) > maxBias) {
            Gq = Gq > 0 ? maxBias : -maxBias
        }
        const GiMf = this.computeGiMf()
        const B = -Gq * a - GW * b - GiMf * h
        return B
    }

    /**
     * Computes G\*q, where q are the generalized body coordinates
     */
    computeGq(): number {
        const G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            ai = bi.angle,
            aj = bj.angle

        return this.gmult(G, qi, ai, qj, aj) + this.offset
    }

    /**
     * Computes G\*W, where W are the body velocities
     */
    computeGW(): number {
        const G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity
        return this.gmult(G, vi, wi, vj, wj) + this.relativeVelocity
    }

    /**
     * Computes G\*Wlambda, where W are the body velocities
     */
    computeGWlambda(): number {
        const G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.vlambda,
            vj = bj.vlambda,
            wi = bi.wlambda,
            wj = bj.wlambda
        return this.gmult(G, vi, wi, vj, wj)
    }

    /**
     * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
     */
    computeGiMf(): number {
        const bi = this.bodyA,
            bj = this.bodyB,
            fi = bi.force,
            ti = bi.angularForce,
            fj = bj.force,
            tj = bj.angularForce,
            invMassi = bi.invMassSolve,
            invMassj = bj.invMassSolve,
            invIi = bi.invInertiaSolve,
            invIj = bj.invInertiaSolve,
            G = this.G

        scale(iMfi, fi, invMassi)
        multiply(iMfi, bi.massMultiplier, iMfi)
        scale(iMfj, fj, invMassj)
        multiply(iMfj, bj.massMultiplier, iMfj)

        return this.gmult(G, iMfi, ti * invIi, iMfj, tj * invIj)
    }

    /**
     * Computes G\*inv(M)\*G'
     */
    computeGiMGt(): number {
        const bi = this.bodyA,
            bj = this.bodyB,
            invMassi = bi.invMassSolve,
            invMassj = bj.invMassSolve,
            invIi = bi.invInertiaSolve,
            invIj = bj.invInertiaSolve,
            G = this.G

        return (
            G[0] * G[0] * invMassi * bi.massMultiplier[0] +
            G[1] * G[1] * invMassi * bi.massMultiplier[1] +
            G[2] * G[2] * invIi +
            G[3] * G[3] * invMassj * bj.massMultiplier[0] +
            G[4] * G[4] * invMassj * bj.massMultiplier[1] +
            G[5] * G[5] * invIj
        )
    }

    /**
     * Add constraint velocity to the bodies.
     * @param deltalambda
     */
    addToWlambda(deltalambda: number): void {
        const bi = this.bodyA,
            bj = this.bodyB,
            invMassi = bi.invMassSolve,
            invMassj = bj.invMassSolve,
            invIi = bi.invInertiaSolve,
            invIj = bj.invInertiaSolve,
            G = this.G

        addToVLambda(bi.vlambda, G[0], G[1], invMassi, deltalambda, bi.massMultiplier)
        bi.wlambda += invIi * G[2] * deltalambda

        addToVLambda(bj.vlambda, G[3], G[4], invMassj, deltalambda, bj.massMultiplier)
        bj.wlambda += invIj * G[5] * deltalambda
    }

    /**
     * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
     * @param eps
     */
    computeInvC(eps: number): number {
        const invC = 1 / (this.computeGiMGt() + eps)
        return invC
    }
}
