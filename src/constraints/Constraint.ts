import type { Equation } from '../equations/Equation'
import type { Body } from '../objects/Body'

export type ConstraintOptions = {
    /**
     * Set to true if you want the connected bodies to collide.
     */
    collideConnected?: boolean

    /**
     * Whether the constraint should wake up bodies when connected
     */
    wakeUpBodies?: boolean
}

/**
 * Base constraint class.
 */
export class Constraint {
    static OTHER: -1 = -1
    static DISTANCE: 1 = 1
    static GEAR: 2 = 2
    static LOCK: 3 = 3
    static PRISMATIC: 4 = 4
    static REVOLUTE: 5 = 5

    /**
     * The type of constraint. May be one of Constraint.DISTANCE, Constraint.GEAR, Constraint.LOCK, Constraint.PRISMATIC or Constraint.REVOLUTE.
     */
    type:
        | typeof Constraint.DISTANCE
        | typeof Constraint.GEAR
        | typeof Constraint.LOCK
        | typeof Constraint.PRISMATIC
        | typeof Constraint.REVOLUTE
        | typeof Constraint.OTHER

    /**
     * Equations to be solved in this constraint
     */
    equations: Equation[]

    /**
     * First body participating in the constraint.
     */
    bodyA: Body

    /**
     * Second body participating in the constraint.
     */
    bodyB: Body

    /**
     * Set to true if you want the connected bodies to collide.
     * @default true
     */
    collideConnected: boolean

    constructor(
        bodyA: Body,
        bodyB: Body,
        type:
            | typeof Constraint.DISTANCE
            | typeof Constraint.GEAR
            | typeof Constraint.LOCK
            | typeof Constraint.PRISMATIC
            | typeof Constraint.REVOLUTE
            | typeof Constraint.OTHER,
        options: ConstraintOptions = {}
    ) {
        this.type = type
        this.equations = []
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.collideConnected = options.collideConnected ?? true

        // Wake up bodies when connected
        if (options.wakeUpBodies !== false) {
            if (bodyA) {
                bodyA.wakeUp()
            }
            if (bodyB) {
                bodyB.wakeUp()
            }
        }
    }

    /**
     * Updates the internal constraint parameters before solve.
     */
    update(): void {
        throw new Error('method update() not implmemented in this Constraint subclass!')
    }

    /**
     * Set stiffness for this constraint.
     * @param stiffness
     */
    setStiffness(stiffness: number): void {
        const eqs = this.equations
        for (let i = 0; i !== eqs.length; i++) {
            const eq = eqs[i]
            eq.stiffness = stiffness
            eq.needsUpdate = true
        }
    }

    /**
     * Set relaxation for this constraint.
     * @param relaxation
     */
    setRelaxation(relaxation: number): void {
        const eqs = this.equations
        for (let i = 0; i !== eqs.length; i++) {
            const eq = eqs[i]
            eq.relaxation = relaxation
            eq.needsUpdate = true
        }
    }

    /**
     * Set max bias for this constraint.
     * @param maxBias
     */
    setMaxBias(maxBias: number): void {
        const eqs = this.equations
        for (let i = 0; i !== eqs.length; i++) {
            const eq = eqs[i]
            eq.maxBias = maxBias
        }
    }
}
