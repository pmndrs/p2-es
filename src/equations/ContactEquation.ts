import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import { Circle } from '../shapes/Circle'
import type { Shape } from '../shapes/Shape'
import type { Vec2 } from '../types'
import { Equation } from './Equation'

function addSubSub(out: Vec2, a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
    out[0] = a[0] + b[0] - c[0] - d[0]
    out[1] = a[1] + b[1] - c[1] - d[1]
}

const vi = vec2.create()
const vj = vec2.create()
const relVel = vec2.create()

const tmpShape = new Circle({ radius: 1 })

/**
 * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
 */
export class ContactEquation extends Equation {
    /**
     * Vector from body i center of mass to the contact point.
     */
    contactPointA: Vec2

    penetrationVec: Vec2

    /**
     * World-oriented vector from body A center of mass to the contact point.
     */
    contactPointB: Vec2

    /**
     * The normal vector, pointing out of body i
     */
    normalA: Vec2

    /**
     * The restitution to use (0=no bounciness, 1=max bounciness).
     */
    restitution: number

    /**
     * This property is set to true if this is the first impact between the bodies (not persistant contact).
     */
    firstImpact: boolean

    /**
     * The shape in body i that triggered this contact.
     */
    shapeA: Shape

    shapeB: Shape

    constructor(bodyA: Body, bodyB: Body) {
        super(bodyA, bodyB, 0, Number.MAX_VALUE)

        this.contactPointA = vec2.create()
        this.penetrationVec = vec2.create()

        this.contactPointB = vec2.create()

        this.normalA = vec2.create()

        this.restitution = 0

        this.firstImpact = false

        this.shapeA = tmpShape
        this.shapeB = tmpShape
    }

    computeB(a: number, b: number, h: number): number {
        const bi = this.bodyA,
            bj = this.bodyB,
            ri = this.contactPointA,
            rj = this.contactPointB,
            xi = bi.position,
            xj = bj.position

        const n = this.normalA
        const G = this.G

        // Caluclate cross products
        const rixn = vec2.crossLength(ri, n)
        const rjxn = vec2.crossLength(rj, n)

        // G = [-n -rixn n rjxn]
        G[0] = -n[0]
        G[1] = -n[1]
        G[2] = -rixn
        G[3] = n[0]
        G[4] = n[1]
        G[5] = rjxn

        // Compute iteration
        let GW, Gq
        if (this.firstImpact && this.restitution !== 0) {
            Gq = 0
            GW = (1 / b) * (1 + this.restitution) * this.computeGW()
        } else {
            // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
            const penetrationVec = this.penetrationVec
            addSubSub(penetrationVec, xj, rj, xi, ri)
            Gq = vec2.dot(n, penetrationVec) + this.offset
            GW = this.computeGW()
        }

        const GiMf = this.computeGiMf()
        const B = -Gq * a - GW * b - h * GiMf

        return B
    }

    /**
     * Get the relative velocity along the normal vector.
     */
    getVelocityAlongNormal(): number {
        this.bodyA.getVelocityAtPoint(vi, this.contactPointA)
        this.bodyB.getVelocityAtPoint(vj, this.contactPointB)

        vec2.subtract(relVel, vi, vj)

        return vec2.dot(this.normalA, relVel)
    }
}
