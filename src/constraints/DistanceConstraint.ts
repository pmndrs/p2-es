import { Equation } from '../equations/Equation'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'
import type { ConstraintOptions } from './Constraint'
import { Constraint } from './Constraint'

export interface DistanceConstraintOptions extends ConstraintOptions {
    distance?: number
    localAnchorA?: Vec2
    localAnchorB?: Vec2
    maxForce?: number
}

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @example
 *     // If distance is not given as an option, then the current distance between the bodies is used.
 *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new DistanceConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     // Manually set the distance and anchors
 *     var constraint = new DistanceConstraint(bodyA, bodyB, {
 *         distance: 1,          // Distance to keep between the points
 *         localAnchorA: [1, 0], // Point on bodyA
 *         localAnchorB: [-1, 0] // Point on bodyB
 *     });
 *     world.addConstraint(constraint);
 */
export class DistanceConstraint extends Constraint {
    /**
     * The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
     */
    localAnchorA: Vec2

    /**
     * The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
     */
    localAnchorB: Vec2

    /**
     * The distance to keep between the anchor points. Defaults to the current distance between the bodies.
     */
    distance: number

    /**
     * Maximum force to apply.
     */
    maxForce: number

    /**
     * If the upper limit is enabled or not.
     */
    upperLimitEnabled: boolean

    /**
     * The upper constraint limit.
     */
    upperLimit: number

    /**
     * If the lower limit is enabled or not.
     */
    lowerLimitEnabled: boolean

    /**
     * The lower constraint limit.
     */
    lowerLimit: number

    /**
     * Current constraint position. This is equal to the current distance between the world anchor points.
     */
    position: number

    constructor(bodyA: Body, bodyB: Body, options?: DistanceConstraintOptions) {
        options = options || {}

        super(bodyA, bodyB, Constraint.DISTANCE, options)

        this.localAnchorA = options.localAnchorA ? vec2.clone(options.localAnchorA) : vec2.create()

        this.localAnchorB = options.localAnchorB ? vec2.clone(options.localAnchorB) : vec2.create()

        const localAnchorA = this.localAnchorA
        const localAnchorB = this.localAnchorB

        this.distance = 0

        if (typeof options.distance === 'number') {
            this.distance = options.distance
        } else {
            // Use the current world distance between the world anchor points.
            const worldAnchorA = vec2.create()
            const worldAnchorB = vec2.create()
            const r = vec2.create()

            // Transform local anchors to world
            vec2.rotate(worldAnchorA, localAnchorA, bodyA.angle)
            vec2.rotate(worldAnchorB, localAnchorB, bodyB.angle)

            vec2.add(r, bodyB.position, worldAnchorB)
            vec2.subtract(r, r, worldAnchorA)
            vec2.subtract(r, r, bodyA.position)

            this.distance = vec2.length(r)
        }

        let maxForce
        if (typeof options.maxForce === 'undefined') {
            maxForce = Number.MAX_VALUE
        } else {
            maxForce = options.maxForce
        }

        const normal = new Equation(bodyA, bodyB, -maxForce, maxForce) // Just in the normal direction
        this.equations = [normal]

        this.maxForce = maxForce

        // g = (xi - xj).dot(n)
        // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'

        // ...and if we were to include offset points:
        // g =
        //      (xj + rj - xi - ri).dot(n) - distance
        //
        // dg/dt =
        //      (vj + wj x rj - vi - wi x ri).dot(n) =
        //      { term 2 is near zero } =
        //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
        //      G * W
        //
        // => G = [-n -rixn n rjxn]

        const r = vec2.create()
        const ri = vec2.create() // worldAnchorA
        const rj = vec2.create() // worldAnchorB

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this
        normal.computeGq = function () {
            const bodyA = this.bodyA,
                bodyB = this.bodyB,
                xi = bodyA.position,
                xj = bodyB.position

            // Transform local anchors to world
            vec2.rotate(ri, localAnchorA, bodyA.angle)
            vec2.rotate(rj, localAnchorB, bodyB.angle)

            vec2.add(r, xj, rj)
            vec2.subtract(r, r, ri)
            vec2.subtract(r, r, xi)

            return vec2.length(r) - that.distance
        }

        // Make the contact constraint bilateral
        this.setMaxForce(maxForce)

        this.upperLimitEnabled = false
        this.upperLimit = 1
        this.lowerLimitEnabled = false
        this.lowerLimit = 0
        this.position = 0
    }

    /**
     * Set the max force to be used
     * @param maxForce
     */
    setMaxForce(maxForce: number): void {
        const normal = this.equations[0]
        normal.minForce = -maxForce
        normal.maxForce = maxForce
    }

    /**
     * Get the max force
     */
    getMaxForce(): number {
        const normal = this.equations[0]
        return normal.maxForce
    }

    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     */
    update(): void {
        const normal = this.equations[0],
            bodyA = this.bodyA,
            bodyB = this.bodyB,
            xi = bodyA.position,
            xj = bodyB.position,
            normalEquation = this.equations[0],
            G = normal.G

        // Transform local anchors to world
        vec2.rotate(ri, this.localAnchorA, bodyA.angle)
        vec2.rotate(rj, this.localAnchorB, bodyB.angle)

        // Get world anchor points and normal
        vec2.add(n, xj, rj)
        vec2.subtract(n, n, ri)
        vec2.subtract(n, n, xi)
        this.position = vec2.length(n)

        let violating = false
        if (this.upperLimitEnabled) {
            if (this.position > this.upperLimit) {
                normalEquation.maxForce = 0
                normalEquation.minForce = -this.maxForce
                this.distance = this.upperLimit
                violating = true
            }
        }

        if (this.lowerLimitEnabled) {
            if (this.position < this.lowerLimit) {
                normalEquation.maxForce = this.maxForce
                normalEquation.minForce = 0
                this.distance = this.lowerLimit
                violating = true
            }
        }

        if ((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating) {
            // No constraint needed.
            normalEquation.enabled = false
            return
        }

        normalEquation.enabled = true

        vec2.normalize(n, n)

        // Caluclate cross products
        const rixn = vec2.crossLength(ri, n),
            rjxn = vec2.crossLength(rj, n)

        // G = [-n -rixn n rjxn]
        G[0] = -n[0]
        G[1] = -n[1]
        G[2] = -rixn
        G[3] = n[0]
        G[4] = n[1]
        G[5] = rjxn
    }
}

const n = vec2.create()
const ri = vec2.create() // worldAnchorA
const rj = vec2.create() // worldAnchorB
