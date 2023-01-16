import { AABB } from '../collision/AABB'
import type { Broadphase } from '../collision/Broadphase'
import { Narrowphase } from '../collision/Narrowphase'
import type { Ray } from '../collision/Ray'
import type { RaycastResult } from '../collision/RaycastResult'
import { SAPBroadphase } from '../collision/SAPBroadphase'
import type { Constraint } from '../constraints/Constraint'
import type { ContactEquation } from '../equations/ContactEquation'
import type { Equation } from '../equations/Equation'
import type { FrictionEquation } from '../equations/FrictionEquation'
import { EventEmitter } from '../events/EventEmitter'
import { ContactMaterial } from '../material/ContactMaterial'
import { Material } from '../material/Material'
import * as vec2 from '../math/vec2'
import { Body } from '../objects/Body'
import type { Spring } from '../objects/Spring'
import { Shape } from '../shapes/Shape'
import { GSSolver } from '../solver/GSSolver'
import type { Solver } from '../solver/Solver'
import type { Vec2 } from '../types'
import { OverlapKeeper } from '../utils/OverlapKeeper'
import type { OverlapKeeperRecord } from '../utils/OverlapKeeperRecord'
import { appendArray, arrayRemove } from '../utils/Utils'
import { UnionFind } from './UnionFind'

export type PostStepEvent = {
    type: 'postStep'
}

export type AddBodyEvent = {
    type: 'addBody'
    body: Body
}

export type RemoveBodyEvent = {
    type: 'removeBody'
    body: Body
}

export type AddSpringEvent = {
    type: 'addSpring'
    spring: Spring
}

export type RemoveSpringEvent = {
    type: 'removeSpring'
    spring: Spring
}

export type ImpactEvent = {
    type: 'impact'
    bodyA: Body
    bodyB: Body
    shapeA: Shape
    shapeB: Shape
    contactEquation: ContactEquation
}

export type PostBroadphaseEvent = {
    type: 'postBroadphase'
    pairs: Body[]
}

export type BeginContactEvent = {
    type: 'beginContact'
    shapeA: Shape
    shapeB: Shape
    bodyA: Body
    bodyB: Body
    contactEquations: ContactEquation[]
}

export type EndContactEvent = {
    type: 'endContact'
    shapeA: Shape
    shapeB: Shape
    bodyA: Body
    bodyB: Body
}

export type PreSolveEvent = {
    type: 'preSolve'
    contactEquations: ContactEquation[]
    frictionEquations: FrictionEquation[]
}

export type WorldEventMap = {
    postStep: PostStepEvent
    addBody: AddBodyEvent
    removeBody: RemoveBodyEvent
    addSpring: AddSpringEvent
    removeSpring: RemoveSpringEvent
    impact: ImpactEvent
    postBroadphase: PostBroadphaseEvent
    beginContact: BeginContactEvent
    endContact: EndContactEvent
    preSolve: PreSolveEvent
}

export interface WorldOptions {
    /**
     * The solver used to satisfy constraints and contacts.
     * @see {@link World.solver}
     */
    solver?: Solver

    /**
     * Gravity in the world.
     * @see {@link World.gravity}
     */
    gravity?: Vec2

    /**
     * The broadphase algorithm to use.
     * @see {@link World.broadphase}
     */
    broadphase?: Broadphase

    /**
     * Whether to enable island splitting.
     * @see {@link World.islandSplit}
     */
    islandSplit?: boolean
}

/**
 * The dynamics world, where all bodies and constraints live.
 *
 * @example
 *     var world = new World({
 *         gravity: [0, -10],
 *         broadphase: new SAPBroadphase()
 *     });
 *     world.addBody(new Body());
 */
export class World extends EventEmitter<WorldEventMap> {
    /**
     * Never deactivate bodies.
     */
    static NO_SLEEPING: 1 = 1

    /**
     * Deactivate individual bodies if they are sleepy.
     */
    static BODY_SLEEPING: 2 = 2

    /**
     * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {@link World.islandSplit} for this to work.
     */
    static ISLAND_SLEEPING: 4 = 4

    /**
     * All springs in the world. To add a spring to the world, use {@link World.addSpring}.
     */
    springs: Spring[] = []

    /**
     * All bodies in the world. To add a body to the world, use {@link World.addBody}.
     */
    bodies: Body[] = []

    /**
     * True if any bodies are not sleeping, false if every body is sleeping.
     */
    hasActiveBodies = false

    /**
     * The solver used to satisfy constraints and contacts. Default is {@link GSSolver}.
     */
    solver: Solver

    /**
     * The narrowphase to use to generate contacts.
     */
    narrowphase = new Narrowphase()

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     */
    gravity: Vec2

    /**
     * Gravity to use when approximating the friction max force (mu*mass*gravity).
     */
    frictionGravity: number

    /**
     * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
     * @default true
     */
    useWorldGravityAsFrictionGravity = true

    /**
     * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
     * @default true
     */
    useFrictionGravityOnZeroGravity = true

    /**
     * The broadphase algorithm to use.
     */
    broadphase: Broadphase

    /**
     * User-added constraints.
     */
    constraints: Constraint[] = []

    /**
     * Dummy default material in the world, used in .defaultContactMaterial
     */
    defaultMaterial: Material

    /**
     * The default contact material to use, if no contact material was set for the colliding materials.
     */
    defaultContactMaterial: ContactMaterial

    /**
     * For keeping track of what time step size we used last step
     */
    lastTimeStep = 1 / 60

    /**
     * Enable to automatically apply spring forces each step.
     * @default true
     */
    applySpringForces = true

    /**
     * Enable to automatically apply body damping each step.
     * @default true
     */
    applyDamping = true

    /**
     * Enable to automatically apply gravity each step.
     * @default true
     */
    applyGravity = true

    /**
     * Enable/disable constraint solving in each step.
     * @default true
     */
    solveConstraints = true

    /**
     * The ContactMaterials added to the World.
     */
    contactMaterials: ContactMaterial[] = []

    /**
     * World time.
     */
    time = 0.0

    /**
     * Accumulator for the world
     */
    accumulator = 0

    /**
     * Is true during step().
     */
    stepping = false

    /**
     * Whether to enable island splitting.
     * Island splitting can be an advantage for both precision and performance.
     * @default false
     */
    islandSplit: boolean

    /**
     * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
     * @default true
     * @deprecated Impact event will be removed. Use beginContact instead.
     */
    emitImpactEvent = true

    /**
     * How to deactivate bodies during simulation. Possible modes are: {@link World,NO_SLEEPING}, {@link World.BODY_SLEEPING} and {@link World.ISLAND_SLEEPING}.
     * If sleeping is enabled, you might need to {@link Body.wakeUp} the bodies if they fall asleep when they shouldn't.
     * If you want to enable sleeping in the world, but want to disable it for a particular body, see {@link Body.allowSleep}.
     * @default World.NO_SLEEPING
     */
    sleepMode: typeof World.NO_SLEEPING | typeof World.BODY_SLEEPING | typeof World.ISLAND_SLEEPING = World.NO_SLEEPING

    /**
     * Overlap keeper for the world
     */
    overlapKeeper = new OverlapKeeper()

    /**
     * Disabled body collision pairs. See {@link World.disableBodyCollision}.
     */
    disabledBodyCollisionPairs: Body[] = []

    private unionFind = new UnionFind(1)

    /**
     * Constructor for a p2-es World
     * @param options options for creating the world
     */
    constructor(options: WorldOptions = {}) {
        super()

        this.solver = options.solver || new GSSolver()

        this.gravity = vec2.fromValues(0, -9.78)
        if (options.gravity) {
            vec2.copy(this.gravity, options.gravity)
        }

        this.frictionGravity = vec2.length(this.gravity) || 10

        this.broadphase = options.broadphase || new SAPBroadphase()
        this.broadphase.setWorld(this)

        this.defaultMaterial = new Material()
        this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial)

        this.islandSplit = options.islandSplit ?? true
    }

    /**
     * Add a constraint to the simulation. Note that both bodies connected to the constraint must be added to the world first. Also note that you can't run this method during step.
     * @param constraint
     *
     * @example
     *     var constraint = new LockConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     */
    addConstraint(constraint: Constraint): void {
        if (this.stepping) {
            throw new Error('Constraints cannot be added during step.')
        }

        const bodies = this.bodies
        if (bodies.indexOf(constraint.bodyA) === -1) {
            throw new Error('Cannot add Constraint: bodyA is not added to the World.')
        }
        if (bodies.indexOf(constraint.bodyB) === -1) {
            throw new Error('Cannot add Constraint: bodyB is not added to the World.')
        }

        this.constraints.push(constraint)
    }

    /**
     * Add a ContactMaterial to the simulation.
     * @param contactMaterial
     */
    addContactMaterial(contactMaterial: ContactMaterial): void {
        this.contactMaterials.push(contactMaterial)
    }

    /**
     * Removes a contact material
     * @param cm
     */
    removeContactMaterial(cm: ContactMaterial): void {
        arrayRemove(this.contactMaterials, cm)
    }

    /**
     * Get a contact material given two materials
     * @param materialA
     * @param materialB
     * @todo Use faster hash map to lookup from material id's
     */
    getContactMaterial(materialA: Material, materialB: Material): ContactMaterial | false {
        const cmats = this.contactMaterials
        for (let i = 0, N = cmats.length; i !== N; i++) {
            const cm = cmats[i]
            if (
                (cm.materialA === materialA && cm.materialB === materialB) ||
                (cm.materialA === materialB && cm.materialB === materialA)
            ) {
                return cm
            }
        }
        return false
    }

    /**
     * Removes a constraint. Note that you can't run this method during step.
     * @param constraint
     */
    removeConstraint(constraint: Constraint): void {
        if (this.stepping) {
            throw new Error('Constraints cannot be removed during step.')
        }
        arrayRemove(this.constraints, constraint)
    }

    /**
     * Step the physics world forward in time.
     *
     * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
     *
     * @param dt The fixed time step size to use.
     * @param timeSinceLastCalled The time elapsed since the function was last called.
     * @param maxSubSteps Maximum number of fixed steps to take per function call.
     *
     * @example
     *     // Simple fixed timestepping without interpolation
     *     var fixedTimeStep = 1 / 60;
     *     var world = new World();
     *     var body = new Body({ mass: 1 });
     *     world.addBody(body);
     *
     *     function animate(){
     *         requestAnimationFrame(animate);
     *         world.step(fixedTimeStep);
     *         renderBody(body.position, body.angle);
     *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @example
     *     // Fixed timestepping with interpolation
     *     var maxSubSteps = 10;
     *     var lastTimeSeconds;
     *
     *     function animate(time){
     *         requestAnimationFrame(animate);
     *         var timeSeconds = time / 1000;
     *
     *         if(lastTimeSeconds){
     *             var deltaTime = timeSeconds - lastTimeSeconds;
     *             world.step(fixedTimeStep, deltaTime, maxSubSteps);
     *         }
     *
     *         lastTimeSeconds = timeSeconds;
     *
     *         renderBody(body.interpolatedPosition, body.interpolatedAngle);
     *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
     */
    step(dt: number, timeSinceLastCalled?: number, maxSubSteps = 10): void {
        if (timeSinceLastCalled === undefined) {
            // Fixed, simple stepping
            this.internalStep(dt)

            // Increment time
            this.time += dt
        } else {
            this.accumulator += timeSinceLastCalled
            let substeps = 0
            while (this.accumulator >= dt && substeps < maxSubSteps) {
                // Do fixed steps to catch up
                this.internalStep(dt)
                this.time += dt
                this.accumulator -= dt
                substeps++
            }

            const t = (this.accumulator % dt) / dt
            for (let j = 0; j !== this.bodies.length; j++) {
                const b = this.bodies[j]
                vec2.lerp(b.interpolatedPosition, b.previousPosition, b.position, t)
                b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle)
            }
        }
    }

    /**
     * Make a fixed step.
     * @param dt
     */
    private internalStep(dt: number): void {
        this.stepping = true

        const Nsprings = this.springs.length,
            springs = this.springs,
            bodies = this.bodies,
            g = this.gravity,
            solver = this.solver,
            Nbodies = this.bodies.length,
            broadphase = this.broadphase,
            np = this.narrowphase,
            constraints = this.constraints,
            mg = step_mg,
            add = vec2.add

        this.overlapKeeper.tick()

        this.lastTimeStep = dt

        // Update approximate friction gravity.
        if (this.useWorldGravityAsFrictionGravity) {
            const gravityLen = vec2.length(this.gravity)
            if (!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)) {
                // Nonzero gravity. Use it.
                this.frictionGravity = gravityLen
            }
        }

        // Add gravity to bodies
        if (this.applyGravity) {
            for (let i = 0; i !== Nbodies; i++) {
                const b = bodies[i],
                    fi = b.force
                if (b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING) {
                    continue
                }
                vec2.scale(mg, g, b.mass * b.gravityScale) // F=m*g
                add(fi, fi, mg)
            }
        }

        // Add spring forces
        if (this.applySpringForces) {
            for (let i = 0; i !== Nsprings; i++) {
                const s = springs[i]
                s.applyForce()
            }
        }

        // Apply damping
        if (this.applyDamping) {
            for (let i = 0; i !== Nbodies; i++) {
                const b = bodies[i]
                if (b.type === Body.DYNAMIC) {
                    b.applyDamping(dt)
                }
            }
        }

        // Get Broadphase collision pairs
        const result = broadphase.getCollisionPairs(this)

        // Remove ignored collision pairs
        const ignoredPairs = this.disabledBodyCollisionPairs
        for (let i = ignoredPairs.length - 2; i >= 0; i -= 2) {
            for (let j = result.length - 2; j >= 0; j -= 2) {
                if (
                    (ignoredPairs[i] === result[j] && ignoredPairs[i + 1] === result[j + 1]) ||
                    (ignoredPairs[i + 1] === result[j] && ignoredPairs[i] === result[j + 1])
                ) {
                    result.splice(j, 2)
                }
            }
        }

        // Remove constrained pairs with collideConnected == false
        let Nconstraints = constraints.length
        for (let i = 0; i !== Nconstraints; i++) {
            const c = constraints[i]
            if (!c.collideConnected) {
                for (let j = result.length - 2; j >= 0; j -= 2) {
                    if (
                        (c.bodyA === result[j] && c.bodyB === result[j + 1]) ||
                        (c.bodyB === result[j] && c.bodyA === result[j + 1])
                    ) {
                        result.splice(j, 2)
                    }
                }
            }
        }

        // postBroadphase event
        this.emit({
            type: 'postBroadphase',
            pairs: result,
        } as PostBroadphaseEvent)

        // Narrowphase
        np.reset()
        const defaultContactMaterial = this.defaultContactMaterial
        const frictionGravity = this.frictionGravity
        for (let i = 0, Nresults = result.length; i !== Nresults; i += 2) {
            const bi = result[i]
            const bj = result[i + 1]

            // Loop over all shapes of body i
            for (let k = 0, Nshapesi = bi.shapes.length; k !== Nshapesi; k++) {
                const si = bi.shapes[k]
                const xi = si.position
                const ai = si.angle

                // All shapes of body j
                for (let l = 0, Nshapesj = bj.shapes.length; l !== Nshapesj; l++) {
                    const sj = bj.shapes[l]
                    const xj = sj.position
                    const aj = sj.angle

                    let contactMaterial: ContactMaterial | false = false
                    if (si.material && sj.material) {
                        contactMaterial = this.getContactMaterial(si.material, sj.material)
                    }

                    runNarrowphase(
                        this,
                        np,
                        bi,
                        si,
                        xi,
                        ai,
                        bj,
                        sj,
                        xj,
                        aj,
                        contactMaterial || defaultContactMaterial,
                        frictionGravity
                    )
                }
            }
        }

        // Wake up bodies
        for (let i = 0; i !== Nbodies; i++) {
            const body = bodies[i]
            if (body._wakeUpAfterNarrowphase) {
                body.wakeUp()
                body._wakeUpAfterNarrowphase = false
            }
        }

        // Emit end overlap events
        if (this.has('endContact')) {
            this.overlapKeeper.getEndOverlaps(endOverlaps)
            let l = endOverlaps.length
            while (l--) {
                const data = endOverlaps[l]
                const e: EndContactEvent = {
                    type: 'endContact',
                    shapeA: data.shapeA,
                    shapeB: data.shapeB,
                    bodyA: data.bodyA,
                    bodyB: data.bodyB,
                }
                this.emit(e)
            }
            endOverlaps.length = 0
        }

        this.emit({
            type: 'preSolve',
            contactEquations: np.contactEquations,
            frictionEquations: np.frictionEquations,
        } as PreSolveEvent)

        // update constraint equations
        Nconstraints = constraints.length
        for (let i = 0; i !== Nconstraints; i++) {
            constraints[i].update()
        }

        if (np.contactEquations.length || np.frictionEquations.length || Nconstraints) {
            // Get all equations
            let equations: Equation[] = []
            appendArray(equations, np.contactEquations)
            appendArray(equations, np.frictionEquations)
            for (let i = 0; i !== Nconstraints; i++) {
                appendArray(equations, constraints[i].equations)
            }

            if (this.islandSplit) {
                // Initialize the UnionFind
                const unionFind = this.unionFind
                unionFind.resize(this.bodies.length + 1)

                // Update equation index
                for (let i = 0; i < equations.length; i++) {
                    equations[i].index = i
                }

                // Unite bodies if they are connected by an equation
                for (let i = 0; i < equations.length; i++) {
                    const bodyA = equations[i].bodyA
                    const bodyB = equations[i].bodyB
                    if (bodyA.type === Body.DYNAMIC && bodyB.type === Body.DYNAMIC) {
                        unionFind.union(bodyA.index, bodyB.index)
                    }
                }

                // Find the body islands
                for (let i = 0; i < bodies.length; i++) {
                    const body = bodies[i]
                    body.islandId = body.type === Body.DYNAMIC ? unionFind.find(body.index) : -1
                }

                // Sort equations by island
                equations = equations.sort(sortEquationsByIsland)

                let equationIndex = 0
                while (equationIndex < equations.length) {
                    const equation = equations[equationIndex++]
                    solver.addEquation(equation)

                    const currentIslandId =
                        equation.bodyA.islandId > 0 ? equation.bodyA.islandId : equation.bodyB.islandId
                    let nextIslandId = -1
                    if (equations[equationIndex]) {
                        nextIslandId =
                            equations[equationIndex].bodyA.islandId > 0
                                ? equations[equationIndex].bodyA.islandId
                                : equations[equationIndex].bodyB.islandId
                    }

                    if (nextIslandId !== currentIslandId || equationIndex === equations.length) {
                        // Solve this island
                        if (this.solveConstraints) {
                            solver.solve(dt, this)
                        }
                        solver.removeAllEquations()
                    }
                }
            } else {
                // Solve all as one island
                solver.addEquations(equations)
                if (this.solveConstraints) {
                    solver.solve(dt, this)
                }
                solver.removeAllEquations()
            }
        }

        // Step forward
        for (let i = 0; i !== Nbodies; i++) {
            const body = bodies[i]
            if (body.type === Body.DYNAMIC || body.type === Body.KINEMATIC) {
                body.integrate(dt)
            }
        }

        // Reset force
        for (let i = 0; i !== Nbodies; i++) {
            bodies[i].setZeroForce()
        }

        // Emit impact event
        if (this.emitImpactEvent && this.has('impact')) {
            for (let i = 0; i !== np.contactEquations.length; i++) {
                const eq = np.contactEquations[i]
                if (eq.firstImpact) {
                    this.emit({
                        type: 'impact',
                        bodyA: eq.bodyA,
                        bodyB: eq.bodyB,
                        shapeA: eq.shapeA,
                        shapeB: eq.shapeB,
                        contactEquation: eq,
                    })
                }
            }
        }

        // Sleeping update
        let hasActiveBodies = true
        if (this.sleepMode === World.BODY_SLEEPING) {
            hasActiveBodies = false

            for (let i = 0; i !== Nbodies; i++) {
                const body = bodies[i]
                body.sleepTick(this.time, false, dt)

                // Check if the body is not sleeping
                if (body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC) {
                    hasActiveBodies = true
                }
            }
        } else if (this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit) {
            // Tell all bodies to sleep tick but dont sleep yet
            for (let i = 0; i !== Nbodies; i++) {
                bodies[i].sleepTick(this.time, true, dt)
            }

            // Sleep islands
            const bodiesSortedByIsland = bodies.sort(sortBodiesByIsland)
            let islandEnd = 1
            for (let islandStart = 0; islandStart < bodiesSortedByIsland.length; islandStart = islandEnd) {
                const islandId = bodiesSortedByIsland[islandStart].islandId

                // Get islandEnd index
                for (
                    islandEnd = islandStart + 1;
                    islandEnd < bodiesSortedByIsland.length && bodiesSortedByIsland[islandEnd].islandId === islandId;
                    islandEnd++ // eslint-disable-next-line no-empty
                ) {}

                // Don't check static objects
                if (islandId === -1) {
                    continue
                }

                let islandShouldSleep = true
                for (let i = islandStart; i < islandEnd; i++) {
                    if (!bodiesSortedByIsland[i].wantsToSleep) {
                        islandShouldSleep = false
                        break
                    }
                }

                if (islandShouldSleep) {
                    for (let i = islandStart; i < islandEnd; i++) {
                        bodiesSortedByIsland[i].sleep()
                    }
                }
            }

            // Check if any bodies are not sleeping
            hasActiveBodies = false
            for (let i = 0; i !== Nbodies; i++) {
                const body = bodies[i]
                if (body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC) {
                    hasActiveBodies = true
                    break
                }
            }
        }
        this.hasActiveBodies = hasActiveBodies

        this.stepping = false

        this.emit({
            type: 'postStep',
        } as PostStepEvent)
    }

    /**
     * Add a spring to the simulation. Note that this operation can't be done during step.
     * @param spring
     */
    addSpring(spring: Spring): void {
        if (this.stepping) {
            throw new Error('Springs cannot be added during step.')
        }
        this.springs.push(spring)
        this.emit({
            type: 'addSpring',
            spring,
        } as AddSpringEvent)
    }

    /**
     * Remove a spring. Note that this operation can't be done during step.
     * @param spring
     */
    removeSpring(spring: Spring): void {
        if (this.stepping) {
            throw new Error('Springs cannot be removed during step.')
        }
        arrayRemove(this.springs, spring)
        this.emit({
            type: 'removeSpring',
            spring,
        } as RemoveSpringEvent)
    }

    /**
     * Add a body to the simulation. Note that you can't add a body during step: you have to wait until after the step (see the postStep event).
     * Also note that bodies can only be added to one World at a time.
     * @param body
     *
     * @example
     *     var world = new World(),
     *         body = new Body();
     *     world.addBody(body);
     */
    addBody(body: Body): void {
        if (this.stepping) {
            throw new Error('Bodies cannot be added during step.')
        }

        // Already added?
        if (body.world) {
            throw new Error('Body is already added to a World.')
        }

        body.index = this.bodies.length
        this.bodies.push(body)
        body.world = this

        this.emit({
            type: 'addBody',
            body,
        } as AddBodyEvent)
    }

    /**
     * Remove a body from the simulation. Note that bodies cannot be removed during step (for example, inside the beginContact event). In that case you need to wait until the step is done (see the postStep event).
     *
     * Also note that any constraints connected to the body must be removed before the body.
     *
     * @param body
     *
     * @example
     *     var removeBody;
     *     world.on("beginContact",function(event){
     *         // We cannot remove the body here since the world is still stepping.
     *         // Instead, schedule the body to be removed after the step is done.
     *         removeBody = body;
     *     });
     *     world.on("postStep",function(event){
     *         if(removeBody){
     *             // Safely remove the body from the world.
     *             world.removeBody(removeBody);
     *             removeBody = null;
     *         }
     *     });
     */
    removeBody(body: Body): void {
        if (this.stepping) {
            throw new Error('Bodies cannot be removed during step.')
        }

        // TODO: would it be smart to have a .constraints array on the body?
        const constraints = this.constraints
        let l = constraints.length
        while (l--) {
            if (constraints[l].bodyA === body || constraints[l].bodyB === body) {
                throw new Error('Cannot remove Body from World: it still has constraints connected to it.')
            }
        }

        body.world = null
        const bodies = this.bodies
        arrayRemove(bodies, body)
        body.index = -1
        l = bodies.length
        while (l--) {
            bodies[l].index = l
        }

        body.resetConstraintVelocity()

        // Emit removeBody event
        this.emit({
            type: 'removeBody',
            body,
        } as RemoveBodyEvent)

        // Remove disabled body collision pairs that involve body
        const pairs = this.disabledBodyCollisionPairs
        let i = 0
        while (i < pairs.length) {
            if (pairs[i] === body || pairs[i + 1] === body) {
                pairs.splice(i, 2)
            } else {
                i += 2
            }
        }
    }

    /**
     * Get a body by its id.
     * @param id
     * @returns The body, or false if it was not found.
     */
    getBodyByID(id: number): Body | false {
        const bodies = this.bodies
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i]
            if (b.id === id) {
                return b
            }
        }
        return false
    }

    /**
     * Disable collision between two bodies
     * @param bodyA
     * @param bodyB
     */
    disableBodyCollision(bodyA: Body, bodyB: Body): void {
        this.disabledBodyCollisionPairs.push(bodyA, bodyB)
    }

    /**
     * Enable collisions between the given two bodies, if they were previously disabled using .disableBodyCollision().
     * @param bodyA
     * @param bodyB
     */
    enableBodyCollision(bodyA: Body, bodyB: Body): void {
        const pairs = this.disabledBodyCollisionPairs
        for (let i = 0; i < pairs.length; i += 2) {
            if ((pairs[i] === bodyA && pairs[i + 1] === bodyB) || (pairs[i + 1] === bodyA && pairs[i] === bodyB)) {
                pairs.splice(i, 2)
                return
            }
        }
    }

    /**
     * Removes all bodies, constraints, springs, and contact materials from the world.
     */
    clear(): void {
        // Remove all solver equations
        this.solver.removeAllEquations()

        // Remove all constraints
        const cs = this.constraints
        let i = cs.length
        while (i--) {
            this.removeConstraint(cs[i])
        }

        // Remove all bodies
        const bodies = this.bodies
        i = bodies.length
        while (i--) {
            this.removeBody(bodies[i])
        }

        // Remove all springs
        const springs = this.springs
        i = springs.length
        while (i--) {
            this.removeSpring(springs[i])
        }

        // Remove all contact materials
        const cms = this.contactMaterials
        i = cms.length
        while (i--) {
            this.removeContactMaterial(cms[i])
        }
    }

    /**
     * Test if a world point overlaps bodies
     * @param worldPoint Point to use for intersection tests
     * @param bodies A list of objects to check for intersection
     * @param precision Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
     * @returns Array of bodies that overlap the point
     *
     * @todo Should use an api similar to the raycast function
     * @todo Should probably implement a .containsPoint method for all shapes. Would be more efficient
     * @todo Should use the broadphase
     * @todo Returning the hit shape would be fine - it carries a reference to the body now
     */
    hitTest(worldPoint: [number, number], bodies: Body[], precision = 0): Body[] {
        // Create a dummy particle body with a particle shape to test against the bodies
        const shapeWorldPosition = hitTest_tmp1,
            shapeLocalPoint = hitTest_tmp2

        const result = []

        // Check bodies
        for (let i = 0, N = bodies.length; i !== N; i++) {
            const body = bodies[i]

            for (let j = 0, NS = body.shapes.length; j !== NS; j++) {
                const shape = body.shapes[j]

                // Get local point position in the shape
                shape.worldPointToLocal(shapeLocalPoint, worldPoint)

                if (shape.pointTest(shapeLocalPoint)) {
                    result.push(body)
                } else {
                    // Get shape world position
                    vec2.rotate(shapeWorldPosition, shape.position, body.angle)
                    vec2.add(shapeWorldPosition, shapeWorldPosition, body.position)

                    if (
                        shape.type === Shape.PARTICLE &&
                        vec2.squaredDistance(shapeWorldPosition, worldPoint) < precision * precision
                    ) {
                        result.push(body)
                    }
                }
            }
        }

        return result
    }

    /**
     * Set the stiffness for all equations and contact materials.
     * @param stiffness
     */
    setGlobalStiffness(stiffness: number): void {
        this.setGlobalEquationParameters({ stiffness: stiffness })

        // Set for all contact materials
        const contactMaterials = this.contactMaterials
        for (let i = 0; i !== contactMaterials.length; i++) {
            const c = contactMaterials[i]
            c.stiffness = c.frictionStiffness = stiffness
        }

        // Set for default contact material
        const c = this.defaultContactMaterial
        c.stiffness = c.frictionStiffness = stiffness
    }

    /**
     * Set the relaxation for all equations and contact materials.
     * @param relaxation
     */
    setGlobalRelaxation(relaxation: number): void {
        this.setGlobalEquationParameters({ relaxation: relaxation })

        // Set for all contact materials
        for (let i = 0; i !== this.contactMaterials.length; i++) {
            const c = this.contactMaterials[i]
            c.relaxation = c.frictionRelaxation = relaxation
        }

        // Set for default contact material
        const c = this.defaultContactMaterial
        c.relaxation = c.frictionRelaxation = relaxation
    }

    /**
     * Ray cast against all bodies in the world.
     * @param result
     * @param ray
     * @return true if any body was hit
     * @example
     *     var ray = new Ray({
     *         mode: Ray.ALL,
     *         from: [0, 0],
     *         to: [10, 0],
     *         callback: function(result){
     *
     *             // Print some info about the hit
     *             console.log('Hit body and shape: ', result.body, result.shape);
     *
     *             // Get the hit point
     *             var hitPoint = vec2.create();
     *             result.getHitPoint(hitPoint, ray);
     *             console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
     *
     *             // If you are happy with the hits you got this far, you can stop the traversal here:
     *             result.stop();
     *         }
     *     });
     *     var result = new RaycastResult();
     *     world.raycast(result, ray);
     * @param result
     * @param ray
     */
    raycast(result: RaycastResult, ray: Ray): boolean {
        // Get all bodies within the ray AABB
        ray.getAABB(tmpRaycastAABB)
        this.broadphase.aabbQuery(this, tmpRaycastAABB, tmpRaycastArray)
        ray.intersectBodies(result, tmpRaycastArray)
        tmpRaycastArray.length = 0

        return result.hasHit()
    }

    private setGlobalEquationParameters(parameters: { relaxation?: number; stiffness?: number }): void {
        const constraints = this.constraints
        for (let i = 0; i !== constraints.length; i++) {
            const c = constraints[i]
            const eqs = c.equations
            for (let j = 0; j !== eqs.length; j++) {
                const eq = eqs[j]
                eq.relaxation = parameters.relaxation ?? eq.relaxation
                eq.stiffness = parameters.stiffness ?? eq.stiffness
                eq.needsUpdate = true
            }
        }
    }
}

function sortBodiesByIsland(a: Body, b: Body): number {
    return a.islandId - b.islandId
}

function sortEquationsByIsland(equationA: Equation, equationB: Equation): number {
    const islandA = equationA.bodyA.islandId > 0 ? equationA.bodyA.islandId : equationA.bodyB.islandId
    const islandB = equationB.bodyA.islandId > 0 ? equationB.bodyA.islandId : equationB.bodyB.islandId

    if (islandA !== islandB) {
        return islandA - islandB
    } else {
        // Sort by equation type if same island
        return equationA.index - equationB.index
    }
}

// Check collision groups and masks
function runNarrowphase(
    world: World,
    np: Narrowphase,
    bi: Body,
    si: Shape,
    xi: Vec2,
    ai: number,
    bj: Body,
    sj: Shape,
    xj: Vec2,
    aj: number,
    cm: ContactMaterial,
    glen: number
) {
    if (!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)) {
        return
    }

    // Get world position and angle of each shape
    vec2.toGlobalFrame(xiw, xi, bi.position, bi.angle)
    vec2.toGlobalFrame(xjw, xj, bj.position, bj.angle)

    if (vec2.distance(xiw, xjw) > si.boundingRadius + sj.boundingRadius) {
        return
    }

    const aiw = ai + bi.angle
    const ajw = aj + bj.angle

    np.enableFriction = cm.friction > 0
    let reducedMass
    if (bi.type === Body.STATIC || bi.type === Body.KINEMATIC) {
        reducedMass = bj.mass
    } else if (bj.type === Body.STATIC || bj.type === Body.KINEMATIC) {
        reducedMass = bi.mass
    } else {
        reducedMass = (bi.mass * bj.mass) / (bi.mass + bj.mass)
    }
    np.slipForce = cm.friction * glen * reducedMass
    np.currentContactMaterial = cm
    np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse

    const resolver = np.narrowphases[si.type | sj.type]
    let numContacts = 0

    if (resolver) {
        const sensor = si.sensor || sj.sensor
        const numFrictionBefore = np.frictionEquations.length
        if (si.type < sj.type) {
            numContacts = resolver.call(np, bi, si as never, xiw, aiw, bj, sj as never, xjw, ajw, sensor)
        } else {
            numContacts = resolver.call(np, bj, sj as never, xjw, ajw, bi, si as never, xiw, aiw, sensor)
        }
        const numFrictionEquations = np.frictionEquations.length - numFrictionBefore

        if (numContacts) {
            if (
                bi.allowSleep &&
                bi.type === Body.DYNAMIC &&
                bi.sleepState === Body.SLEEPING &&
                bj.sleepState === Body.AWAKE &&
                bj.type !== Body.STATIC
            ) {
                const speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity, 2)
                const speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2)
                if (speedSquaredB >= speedLimitSquaredB * 2) {
                    bi._wakeUpAfterNarrowphase = true
                }
            }

            if (
                bj.allowSleep &&
                bj.type === Body.DYNAMIC &&
                bj.sleepState === Body.SLEEPING &&
                bi.sleepState === Body.AWAKE &&
                bi.type !== Body.STATIC
            ) {
                const speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity, 2)
                const speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2)
                if (speedSquaredA >= speedLimitSquaredA * 2) {
                    bj._wakeUpAfterNarrowphase = true
                }
            }

            world.overlapKeeper.setOverlapping(bi, si, bj, sj)
            if (world.has('beginContact') && world.overlapKeeper.isNewOverlap(si, sj)) {
                // Report new shape overlap
                const equations: ContactEquation[] = []

                if (!sensor) {
                    for (let i = np.contactEquations.length - numContacts; i < np.contactEquations.length; i++) {
                        equations.push(np.contactEquations[i])
                    }
                }

                world.emit({
                    type: 'beginContact',
                    shapeA: si,
                    shapeB: sj,
                    bodyA: bi,
                    bodyB: bj,
                    contactEquations: equations,
                } as BeginContactEvent)
            }

            // divide the max friction force by the number of contacts
            if (!sensor && numFrictionEquations > 1) {
                // Why divide by 1?
                for (let i = np.frictionEquations.length - numFrictionEquations; i < np.frictionEquations.length; i++) {
                    const f = np.frictionEquations[i]
                    f.setSlipForce(f.getSlipForce() / numFrictionEquations)
                }
            }
        }
    }
}

const tmpRaycastAABB = new AABB()
const tmpRaycastArray: Body[] = []

const step_mg = vec2.create(),
    xiw = vec2.create(),
    xjw = vec2.create()

const endOverlaps: OverlapKeeperRecord[] = []

const hitTest_tmp1 = vec2.create(),
    hitTest_tmp2 = vec2.create()
