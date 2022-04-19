import * as vec2 from '../math/vec2'
import type { Vec2 } from '../types'
import type { Body } from './Body'
import type { SpringOptions } from './Spring'
import { Spring } from './Spring'

export interface LinearSpringOptions extends SpringOptions {
    /**
     * A number > 0. Default is the current distance between the world anchor points.
     */
    restLength?: number

    /**
     * Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
     */
    localAnchorA?: Vec2

    /**
     * Where to hook the spring to body B, in local body coordinates. Defaults to the body center.
     */
    localAnchorB?: Vec2

    /**
     * Where to hook the spring to body A, using world coordinates.
     */
    worldAnchorA?: Vec2

    /**
     * Where to hook the spring to body B, using world coordinates.
     */
    worldAnchorB?: Vec2

    /**
     * Spring constant (see Hookes Law). A number >= 0.
     */
    stiffness?: number

    /**
     * A number >= 0. Default: 1
     */
    damping?: number
}

/**
 * A spring, connecting two bodies.
 *
 * The Spring explicitly adds force and angularForce to the bodies.
 *
 * @example
 *     var spring = new LinearSpring(bodyA, bodyB, {
 *         stiffness: 100,
 *         damping: 1,
 *         localAnchorA: [0,0], // center of bodyA
 *         localAnchorB: [0,0] // center of bodyB
 *     });
 *     world.addSpring(spring);
 */
export class LinearSpring extends Spring {
    /**
     * Anchor for bodyA in local bodyA coordinates.
     */
    localAnchorA: Vec2

    /**
     * Anchor for bodyB in local bodyB coordinates.
     */
    localAnchorB: Vec2

    /**
     * Rest length of the spring. Can be set dynamically.
     */
    restLength: number

    constructor(bodyA: Body, bodyB: Body, options: LinearSpringOptions = {}) {
        super(bodyA, bodyB, options)

        this.localAnchorA = vec2.create()
        this.localAnchorB = vec2.create()

        if (options.localAnchorA) {
            vec2.copy(this.localAnchorA, options.localAnchorA)
        }
        if (options.localAnchorB) {
            vec2.copy(this.localAnchorB, options.localAnchorB)
        }
        if (options.worldAnchorA) {
            this.setWorldAnchorA(options.worldAnchorA)
        }
        if (options.worldAnchorB) {
            this.setWorldAnchorB(options.worldAnchorB)
        }

        const worldAnchorA = vec2.create()
        const worldAnchorB = vec2.create()
        this.getWorldAnchorA(worldAnchorA)
        this.getWorldAnchorB(worldAnchorB)
        const worldDistance = vec2.distance(worldAnchorA, worldAnchorB)

        this.restLength = options.restLength !== undefined ? options.restLength : worldDistance
    }

    /**
     * Set the anchor point on body A, using world coordinates.
     * @param worldAnchorA
     */
    setWorldAnchorA(worldAnchorA: Vec2): void {
        this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA)
    }

    /**
     * Set the anchor point on body B, using world coordinates.
     * @param worldAnchorB
     */
    setWorldAnchorB(worldAnchorB: Vec2): void {
        this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB)
    }

    /**
     * Get the anchor point on body A, in world coordinates.
     * @param result
     */
    getWorldAnchorA(result: Vec2): void {
        this.bodyA.toWorldFrame(result, this.localAnchorA)
    }

    /**
     * Set the anchor point on body B, using world coordinates.
     * @param result
     */
    getWorldAnchorB(result: Vec2): void {
        this.bodyB.toWorldFrame(result, this.localAnchorB)
    }

    /**
     * Apply the spring force to the connected bodies
     */
    applyForce(): void {
        const k = this.stiffness,
            d = this.damping,
            l = this.restLength,
            bodyA = this.bodyA,
            bodyB = this.bodyB,
            r = applyForce_r,
            r_unit = applyForce_r_unit,
            u = applyForce_u,
            f = applyForce_f,
            tmp = applyForce_tmp

        const worldAnchorA = applyForce_worldAnchorA,
            worldAnchorB = applyForce_worldAnchorB,
            ri = applyForce_ri,
            rj = applyForce_rj

        // Get world anchors
        this.getWorldAnchorA(worldAnchorA)
        this.getWorldAnchorB(worldAnchorB)

        // Get offset points
        vec2.subtract(ri, worldAnchorA, bodyA.position)
        vec2.subtract(rj, worldAnchorB, bodyB.position)

        // Compute distance vector between world anchor points
        vec2.subtract(r, worldAnchorB, worldAnchorA)
        const rlen = vec2.length(r)
        vec2.normalize(r_unit, r)

        // Compute relative velocity of the anchor points, u
        vec2.subtract(u, bodyB.velocity, bodyA.velocity)
        vec2.crossZV(tmp, bodyB.angularVelocity, rj)
        vec2.add(u, u, tmp)
        vec2.crossZV(tmp, bodyA.angularVelocity, ri)
        vec2.subtract(u, u, tmp)

        // F = - k * ( x - L ) - D * ( u )
        vec2.scale(f, r_unit, -k * (rlen - l) - d * vec2.dot(u, r_unit))

        // Add forces to bodies
        vec2.subtract(bodyA.force, bodyA.force, f)
        vec2.add(bodyB.force, bodyB.force, f)

        // Angular force
        const ri_x_f = vec2.crossLength(ri, f)
        const rj_x_f = vec2.crossLength(rj, f)
        bodyA.angularForce -= ri_x_f
        bodyB.angularForce += rj_x_f
    }
}

const applyForce_r = vec2.create()
const applyForce_r_unit = vec2.create()
const applyForce_u = vec2.create()
const applyForce_f = vec2.create()
const applyForce_worldAnchorA = vec2.create()
const applyForce_worldAnchorB = vec2.create()
const applyForce_ri = vec2.create()
const applyForce_rj = vec2.create()
const applyForce_tmp = vec2.create()
