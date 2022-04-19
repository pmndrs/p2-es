import type { Equation } from '../equations/Equation'
import { FrictionEquation } from '../equations/FrictionEquation'
import type { World } from '../world/World'
import type { SolverOptions } from './Solver'
import { Solver } from './Solver'

export interface GSSolverOptions extends SolverOptions {
    /**
     * The max number of iterations to do when solving. More gives better results, but is more expensive.
     * @see {@link GSSolver.iterations}
     */
    iterations?: number

    /**
     * The error tolerance, per constraint.
     * @see {@link GSSolver.tolerance}
     */
    tolerance?: number

    /**
     * Number of solver iterations that are used to approximate normal forces used for friction
     * @see {@link GSSolver.frictionIterations}
     */
    frictionIterations?: number
}

/**
 * Iterative Gauss-Seidel constraint equation solver.
 */
export class GSSolver extends Solver {
    type = Solver.GS

    /**
     * The max number of iterations to do when solving. More gives better results, but is more expensive.
     */
    iterations: number

    /**
     * The error tolerance, per constraint. If the total error is below this limit, the solver will stop iterating. Set to zero for as good solution as possible, but to something larger than zero to make computations faster.
     * @default 1e-7
     */
    tolerance: number

    /**
     * Number of solver iterations that are used to approximate normal forces used for friction (F_friction = mu * F_normal). These friction forces will override any other friction forces that are set. If you set frictionIterations = 0, then this feature will be disabled.
     *
     * Use only frictionIterations > 0 if the approximated normal force (F_normal = mass * gravity) is not good enough. Examples of where it can happen is in space games where gravity is zero, or in tall stacks where the normal force is large at bottom but small at top.
     * @default 0
     */
    frictionIterations: number

    /**
     * The number of iterations that were made during the last solve. If .tolerance is zero, this value will always be equal to .iterations, but if .tolerance is larger than zero, and the solver can quit early, then this number will be somewhere between 1 and .iterations.
     */
    usedIterations: number

    constructor(options: GSSolverOptions = {}) {
        super(options, Solver.GS)

        this.iterations = options.iterations || 10
        this.tolerance = options.tolerance ?? 1e-7
        this.frictionIterations = options.frictionIterations ?? 0
        this.usedIterations = 0
    }

    solve(h: number, world: World): void {
        this.sortEquations()

        let iter = 0
        const maxIter = this.iterations
        const maxFrictionIter = this.frictionIterations
        const equations = this.equations
        const Neq = equations.length
        const tolSquared = Math.pow(this.tolerance * Neq, 2)
        const bodies = world.bodies
        const Nbodies = bodies.length

        this.usedIterations = 0

        if (Neq) {
            for (let i = 0; i !== Nbodies; i++) {
                const b = bodies[i]

                // Update solve mass
                b.updateSolveMassProperties()
            }
        }

        for (let i = 0; i !== Neq; i++) {
            const c = equations[i]
            c.lambda = 0
            if (c.timeStep !== h || c.needsUpdate) {
                c.timeStep = h
                c.update()
            }
            c.B = c.computeB(c.a, c.b, h)
            c.invC = c.computeInvC(c.epsilon)

            c.maxForceDt = c.maxForce * h
            c.minForceDt = c.minForce * h
        }

        let c, deltalambdaTot, i, j

        if (Neq !== 0) {
            for (i = 0; i !== Nbodies; i++) {
                const b = bodies[i]

                // Reset vlambda
                b.resetConstraintVelocity()
            }

            if (maxFrictionIter) {
                // Iterate over contact equations to get normal forces
                for (iter = 0; iter !== maxFrictionIter; iter++) {
                    // Accumulate the total error for each iteration.
                    deltalambdaTot = 0.0

                    for (j = 0; j !== Neq; j++) {
                        c = equations[j]

                        const deltalambda = iterateEquation(c)
                        deltalambdaTot += Math.abs(deltalambda)
                    }

                    this.usedIterations++

                    // If the total error is small enough - stop iterate
                    if (deltalambdaTot * deltalambdaTot <= tolSquared) {
                        break
                    }
                }

                updateMultipliers(equations, 1 / h)

                // Set computed friction force
                for (j = 0; j !== Neq; j++) {
                    const eq = equations[j]
                    if (eq instanceof FrictionEquation) {
                        let f = 0.0
                        for (let k = 0; k !== eq.contactEquations.length; k++) {
                            f += eq.contactEquations[k].multiplier
                        }
                        f *= eq.frictionCoefficient / eq.contactEquations.length
                        eq.maxForce = f
                        eq.minForce = -f

                        eq.maxForceDt = f * h
                        eq.minForceDt = -f * h
                    }
                }
            }

            // Iterate over all equations
            for (iter = 0; iter !== maxIter; iter++) {
                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0
                for (j = 0; j !== Neq; j++) {
                    c = equations[j]

                    const deltalambda = iterateEquation(c)
                    deltalambdaTot += Math.abs(deltalambda)
                }

                this.usedIterations++

                // If the total error is small enough - stop iterate
                if (deltalambdaTot * deltalambdaTot < tolSquared) {
                    break
                }
            }

            // Add result to velocity
            for (i = 0; i !== Nbodies; i++) {
                bodies[i].addConstraintVelocity()
            }

            updateMultipliers(equations, 1 / h)
        }
    }
}

// Sets the .multiplier property of each equation
function updateMultipliers(equations: Equation[], invDt: number) {
    let l = equations.length
    while (l--) {
        const eq = equations[l]
        eq.multiplier = eq.lambda * invDt
    }
}

function iterateEquation(eq: Equation) {
    // Compute iteration
    const B = eq.B,
        eps = eq.epsilon,
        invC = eq.invC,
        lambdaj = eq.lambda,
        GWlambda = eq.computeGWlambda(),
        maxForce_dt = eq.maxForceDt,
        minForce_dt = eq.minForceDt

    let deltalambda = invC * (B - GWlambda - eps * lambdaj)

    // Clamp if we are not within the min/max interval
    const lambdaj_plus_deltalambda = lambdaj + deltalambda
    if (lambdaj_plus_deltalambda < minForce_dt) {
        deltalambda = minForce_dt - lambdaj
    } else if (lambdaj_plus_deltalambda > maxForce_dt) {
        deltalambda = maxForce_dt - lambdaj
    }
    eq.lambda += deltalambda
    eq.addToWlambda(deltalambda)

    return deltalambda
}
