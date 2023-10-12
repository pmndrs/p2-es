import { Equation } from '../equations/Equation'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import type { Vec2 } from '../types'
import type { ConstraintOptions } from './Constraint'
import { Constraint } from './Constraint'

export interface LockConstraintOptions extends ConstraintOptions {
    /**
     * The offset of bodyB in bodyA's frame. If not given the offset is computed from current positions.
     */
    localOffsetB?: Vec2

    /**
     * The angle of bodyB in bodyA's frame. If not given, the angle is computed from current angles.
     */
    localAngleB?: number

    /**
     * The max force for the constraint
     */
    maxForce?: number
}

/**
 * Locks the relative position and rotation between two bodies.
 *
 * @example
 *     // Locks the relative position and rotation between bodyA and bodyB
 *     var constraint = new LockConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 */
export class LockConstraint extends Constraint {
    /**
     * The offset of bodyB in bodyA's frame.
     */
    localOffsetB: Vec2

    /**
     * The offset angle of bodyB in bodyA's frame.
     */
    localAngleB: number

    constructor(bodyA: Body, bodyB: Body, options: LockConstraintOptions = {}) {
        super(bodyA, bodyB, Constraint.LOCK, options)

        const maxForce = typeof options.maxForce === 'undefined' ? Number.MAX_VALUE : options.maxForce

        // Use 3 equations:
        // gx =   (xj - xi - l) * xhat = 0
        // gy =   (xj - xi - l) * yhat = 0
        // gr =   (xi - xj + r) * that = 0
        //
        // ...where:
        //   l is the localOffsetB vector rotated to world in bodyA frame
        //   r is the same vector but reversed and rotated from bodyB frame
        //   xhat, yhat are world axis vectors
        //   that is the tangent of r
        //
        // For the first two constraints, we get
        // G*W = (vj - vi - ldot  ) * xhat
        //     = (vj - vi - wi x l) * xhat
        //
        // Since (wi x l) * xhat = (l x xhat) * wi, we get
        // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
        //
        // The last constraint gives
        // GW = (vi - vj + wj x r) * that
        //    = [  that   0  -that  (r x t) ]

        const x = new Equation(bodyA, bodyB, -maxForce, maxForce),
            y = new Equation(bodyA, bodyB, -maxForce, maxForce),
            rot = new Equation(bodyA, bodyB, -maxForce, maxForce)

        const l = vec2.create(),
            g = vec2.create(),
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            that = this
        x.computeGq = function () {
            vec2.rotate(l, that.localOffsetB, bodyA.angle)
            vec2.subtract(g, bodyB.position, bodyA.position)
            vec2.subtract(g, g, l)
            return g[0]
        }
        y.computeGq = function () {
            vec2.rotate(l, that.localOffsetB, bodyA.angle)
            vec2.subtract(g, bodyB.position, bodyA.position)
            vec2.subtract(g, g, l)
            return g[1]
        }
        const r = vec2.create(),
            t = vec2.create()
        rot.computeGq = function () {
            vec2.rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB)
            vec2.scale(r, r, -1)
            vec2.subtract(g, bodyA.position, bodyB.position)
            vec2.add(g, g, r)
            vec2.rotate(t, r, -Math.PI / 2)
            vec2.normalize(t, t)
            return vec2.dot(g, t)
        }

        this.localOffsetB = vec2.create()
        if (options.localOffsetB) {
            vec2.copy(this.localOffsetB, options.localOffsetB)
        } else {
            // Construct from current positions
            vec2.subtract(this.localOffsetB, bodyB.position, bodyA.position)
            vec2.rotate(this.localOffsetB, this.localOffsetB, -bodyA.angle)
        }

        this.localAngleB = 0
        if (typeof options.localAngleB === 'number') {
            this.localAngleB = options.localAngleB
        } else {
            // Construct
            this.localAngleB = bodyB.angle - bodyA.angle
        }

        this.equations.push(x, y, rot)
        this.setMaxForce(maxForce)
    }

    /**
     * Set the maximum force to be applied.
     * @param force
     */
    setMaxForce(force: number): void {
        const eqs = this.equations;
        const l = eqs.length;
        for (let i = 0; i < l; i++) {
            eqs[i].maxForce = force
            eqs[i].minForce = -force
        }
    }

    /**
     * Get the max force.
     */
    getMaxForce(): number {
        return this.equations[0].maxForce
    }

    update(): void {
        const x = this.equations[0],
            y = this.equations[1],
            rot = this.equations[2],
            bodyA = this.bodyA,
            bodyB = this.bodyB

        vec2.rotate(l, this.localOffsetB, bodyA.angle)
        vec2.rotate(r, this.localOffsetB, bodyB.angle - this.localAngleB)
        vec2.scale(r, r, -1)

        vec2.rotate(t, r, Math.PI / 2)
        vec2.normalize(t, t)

        x.G[0] = -1
        x.G[1] = 0
        x.G[2] = -vec2.crossLength(l, xAxis)
        x.G[3] = 1

        y.G[0] = 0
        y.G[1] = -1
        y.G[2] = -vec2.crossLength(l, yAxis)
        y.G[4] = 1

        rot.G[0] = -t[0]
        rot.G[1] = -t[1]
        rot.G[3] = t[0]
        rot.G[4] = t[1]
        rot.G[5] = vec2.crossLength(r, t)
    }
}

const l = vec2.create()
const r = vec2.create()
const t = vec2.create()
const xAxis = vec2.fromValues(1, 0)
const yAxis = vec2.fromValues(0, 1)
