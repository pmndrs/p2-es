import type { Equation } from '../equations/Equation'
import type { World } from '../world/World'

export interface SolverOptions {
    /**
     * Function that is used to sort all equations before each solve.
     */
    equationSortFunction?: (a: Equation, b: Equation) => number
}

/**
 * Base class for constraint solvers.
 */
export abstract class Solver {
    /**
     * Gauss-Seidel solver.
     */
    static GS: 1

    /**
     * The type of solver.
     */
    type: number

    /**
     * Current equations in the solver.
     */
    equations: Equation[]

    /**
     * Function that is used to sort all equations before each solve.
     */
    equationSortFunction?: (a: Equation, b: Equation) => number

    constructor(options: SolverOptions = {}, type: typeof Solver.GS) {
        this.type = type
        this.equations = []
        this.equationSortFunction = options.equationSortFunction
    }

    /**
     * Method to be implemented in each subclass
     * @param dt
     * @param world
     */
    abstract solve(dt: number, world: World): void

    /**
     * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
     */
    sortEquations(): void {
        if (this.equationSortFunction) {
            this.equations.sort(this.equationSortFunction)
        }
    }

    /**
     * Add an equation to be solved.
     * @param eq
     */
    addEquation(eq: Equation): void {
        if (eq.enabled) {
            this.equations.push(eq)
        }
    }

    /**
     * Add equations. Same as .addEquation, but this time the argument is an array of Equations
     * @param eqs
     */
    addEquations(eqs: Equation[]): void {
        for (let i = 0, N = eqs.length; i !== N; i++) {
            const eq = eqs[i]
            if (eq.enabled) {
                this.equations.push(eq)
            }
        }
    }

    /**
     * Removes an equation
     * @param eq
     */
    removeEquation(eq: Equation): void {
        const l = this.equations.length;
        for (let i = 0; i < l; i++) {
            if (this.equations[i] === eq) {
                this.equations.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Removes all currently added equations
     */
    removeAllEquations(): void {
        this.equations.length = 0
    }
}
