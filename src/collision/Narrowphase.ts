import type { Heightfield } from 'shapes/Heightfield'

import type { ContactEquation } from '../equations/ContactEquation'
import type { FrictionEquation } from '../equations/FrictionEquation'
import type { ContactMaterial } from '../material/ContactMaterial'
import * as vec2 from '../math/vec2'
import type { Body } from '../objects/Body'
import { Box } from '../shapes/Box'
import type { Capsule } from '../shapes/Capsule'
import { Circle } from '../shapes/Circle'
import { Convex } from '../shapes/Convex'
import type { Line } from '../shapes/Line'
import type { Particle } from '../shapes/Particle'
import type { Plane } from '../shapes/Plane'
import { Shape } from '../shapes/Shape'
import type { Vec2 } from '../types'
import { ContactEquationPool } from '../utils/ContactEquationPool'
import { FrictionEquationPool } from '../utils/FrictionEquationPool'
import { TupleDictionary } from '../utils/TupleDictionary'

/**
 * Narrowphase. Creates contacts and friction given shapes and transforms.
 */
export class Narrowphase {
    /**
     * Contact equations
     */
    contactEquations: ContactEquation[]

    /**
     * Friction equations
     */
    frictionEquations: FrictionEquation[]

    /**
     * Whether to make friction equations in the upcoming contacts.
     */
    enableFriction: boolean

    /**
     * Whether to make equations enabled in upcoming contacts.
     */
    enabledEquations: boolean

    /**
     * The friction slip force to use when creating friction equations.
     */
    slipForce: number

    /**
     * Keeps track of the allocated ContactEquations.
     *
     * @example
     *     // Allocate a few equations before starting the simulation.
     *     // This way, no contact objects need to be created on the fly in the game loop.
     *     world.narrowphase.contactEquationPool.resize(1024);
     *     world.narrowphase.frictionEquationPool.resize(1024);
     */
    contactEquationPool: ContactEquationPool

    /**
     * Keeps track of the allocated ContactEquations.
     */
    frictionEquationPool: FrictionEquationPool

    /**
     * Enable reduction of friction equations.
     * If disabled, a box on a plane will generate 2 contact equations and 2 friction equations.
     * If enabled, there will be only one friction equation. Same kind of simplifications are made for all collision types.
     * @deprecated This flag will be removed when the feature is stable enough.
     * @default true
     */
    enableFrictionReduction: boolean

    /**
     * Keeps track of the colliding bodies last step.
     */
    collidingBodiesLastStep: TupleDictionary<boolean>

    /**
     * The current contact material
     */
    currentContactMaterial: ContactMaterial | null

    constructor() {
        this.contactEquations = []
        this.frictionEquations = []
        this.enableFriction = true
        this.enabledEquations = true
        this.slipForce = 10.0
        this.contactEquationPool = new ContactEquationPool({ size: 32 })
        this.frictionEquationPool = new FrictionEquationPool({ size: 64 })
        this.enableFrictionReduction = true
        this.collidingBodiesLastStep = new TupleDictionary()
        this.currentContactMaterial = null
    }

    bodiesOverlap(bodyA: Body, bodyB: Body, checkCollisionMasks?: boolean): boolean {
        const shapePositionA = bodiesOverlap_shapePositionA
        const shapePositionB = bodiesOverlap_shapePositionB

        // Loop over all shapes of bodyA
        for (let k = 0, Nshapesi = bodyA.shapes.length; k !== Nshapesi; k++) {
            const shapeA = bodyA.shapes[k]

            // All shapes of body j
            for (let l = 0, Nshapesj = bodyB.shapes.length; l !== Nshapesj; l++) {
                const shapeB = bodyB.shapes[l]

                // Check collision groups and masks
                if (
                    checkCollisionMasks &&
                    !(
                        (shapeA.collisionGroup & shapeB.collisionMask) !== 0 &&
                        (shapeB.collisionGroup & shapeA.collisionMask) !== 0
                    )
                ) {
                    // todo - was undefined, check
                    return false
                }

                bodyA.toWorldFrame(shapePositionA, shapeA.position)
                bodyB.toWorldFrame(shapePositionB, shapeB.position)

                if (shapeA.type <= shapeB.type) {
                    if (
                        this.narrowphases[shapeA.type | shapeB.type](
                            bodyA,
                            // @ts-expect-error todo
                            shapeA,
                            shapePositionA,
                            shapeA.angle + bodyA.angle,
                            bodyB,
                            shapeB,
                            shapePositionB,
                            shapeB.angle + bodyB.angle,
                            true
                        )
                    ) {
                        return true
                    }
                } else {
                    if (
                        this.narrowphases[shapeA.type | shapeB.type](
                            bodyB,
                            // @ts-expect-error todo
                            shapeB,
                            shapePositionB,
                            shapeB.angle + bodyB.angle,
                            bodyA,
                            shapeA,
                            shapePositionA,
                            shapeA.angle + bodyA.angle,
                            true
                        )
                    ) {
                        return true
                    }
                }
            }
        }

        return false
    }

    /**
     * Check if the bodies were in contact since the last reset().
     * @param bodyA
     * @param bodyB
     * @returns
     */
    collidedLastStep(bodyA: Body, bodyB: Body): boolean {
        const id1 = bodyA.id | 0
        const id2 = bodyB.id | 0
        return !!this.collidingBodiesLastStep.get(id1, id2)
    }

    /**
     * Throws away the old equations and gets ready to create new
     */
    reset(): void {
        this.collidingBodiesLastStep.reset()

        const eqs = this.contactEquations
        let l = eqs.length
        while (l--) {
            const eq = eqs[l],
                id1 = eq.bodyA.id,
                id2 = eq.bodyB.id
            this.collidingBodiesLastStep.set(id1, id2, true)
        }

        const ce = this.contactEquations,
            fe = this.frictionEquations
        for (let i = 0; i < ce.length; i++) {
            this.contactEquationPool.release(ce[i])
        }
        for (let i = 0; i < fe.length; i++) {
            this.frictionEquationPool.release(fe[i])
        }

        // Reset
        this.contactEquations.length = this.frictionEquations.length = 0
    }

    /**
     * Creates a ContactEquation, either by reusing an existing object or creating a new one.
     * @param bodyA
     * @param bodyB
     * @param shapeA
     * @param shapeB
     */
    createContactEquation(bodyA: Body, bodyB: Body, shapeA: Shape, shapeB: Shape): ContactEquation {
        const c = this.contactEquationPool.get()
        const currentContactMaterial = this.currentContactMaterial
        c.bodyA = bodyA
        c.bodyB = bodyB
        c.shapeA = shapeA
        c.shapeB = shapeB
        c.enabled = this.enabledEquations
        c.firstImpact = !this.collidedLastStep(bodyA, bodyB)

        c.restitution = currentContactMaterial!.restitution
        c.stiffness = currentContactMaterial!.stiffness
        c.relaxation = currentContactMaterial!.relaxation
        c.offset = currentContactMaterial!.contactSkinSize

        c.needsUpdate = true

        return c
    }

    /**
     * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
     * @param bodyA
     * @param bodyB
     * @param shapeA
     * @param shapeB
     */
    createFrictionEquation(bodyA: Body, bodyB: Body, shapeA: Shape, shapeB: Shape): FrictionEquation {
        const c = this.frictionEquationPool.get()
        const currentContactMaterial = this.currentContactMaterial
        c.bodyA = bodyA
        c.bodyB = bodyB
        c.shapeA = shapeA
        c.shapeB = shapeB
        c.setSlipForce(this.slipForce)
        c.enabled = this.enabledEquations

        c.frictionCoefficient = currentContactMaterial!.friction
        c.relativeVelocity = currentContactMaterial!.surfaceVelocity
        c.stiffness = currentContactMaterial!.frictionStiffness
        c.relaxation = currentContactMaterial!.frictionRelaxation
        c.needsUpdate = true

        c.contactEquations.length = 0
        return c
    }

    /**
     * Creates a FrictionEquation given the data in the ContactEquation.
     * Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
     * @param c
     */
    createFrictionFromContact(c: ContactEquation): FrictionEquation {
        const eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA!, c.shapeB!)
        vec2.copy(eq.contactPointA, c.contactPointA)
        vec2.copy(eq.contactPointB, c.contactPointB)
        vec2.rotate90cw(eq.t, c.normalA)
        eq.contactEquations.push(c)
        return eq
    }

    createFrictionFromAverage(numContacts: number): FrictionEquation {
        let c = this.contactEquations[this.contactEquations.length - 1]
        const eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA!, c.shapeB!)
        const bodyA = c.bodyA
        vec2.set(eq.contactPointA, 0, 0)
        vec2.set(eq.contactPointB, 0, 0)
        vec2.set(eq.t, 0, 0)
        for (let i = 0; i !== numContacts; i++) {
            c = this.contactEquations[this.contactEquations.length - 1 - i]
            if (c.bodyA === bodyA) {
                vec2.add(eq.t, eq.t, c.normalA)
                vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointA)
                vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointB)
            } else {
                vec2.sub(eq.t, eq.t, c.normalA)
                vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointB)
                vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointA)
            }
            eq.contactEquations.push(c)
        }

        const invNumContacts = 1 / numContacts
        vec2.scale(eq.contactPointA, eq.contactPointA, invNumContacts)
        vec2.scale(eq.contactPointB, eq.contactPointB, invNumContacts)
        vec2.normalize(eq.t, eq.t)
        vec2.rotate90cw(eq.t, eq.t)
        return eq
    }

    /**
     * Convex/Line Narrowphase.
     * @todo
     * @param _convexBody
     * @param _convexShape
     * @param _convexOffset
     * @param _convexAngle
     * @param _lineBody
     * @param _lineShape
     * @param _lineOffset
     * @param _lineAngle
     * @param _justTest
     * @returns
     */
    convexLine = (
        _convexBody: Body,
        _convexShape: Convex,
        _convexOffset: Vec2,
        _convexAngle: number,
        _lineBody: Body,
        _lineShape: Line,
        _lineOffset: Vec2,
        _lineAngle: number,
        _justTest = false
    ): number => {
        return 0
    }

    /**
     * Line/Box Narrowphase.
     * @todo
     * @param _lineBody
     * @param _lineShape
     * @param _lineOffset
     * @param _lineAngle
     * @param _boxBody
     * @param _boxShape
     * @param _boxOffset
     * @param _boxAngle
     * @param _justTest
     * @returns
     */
    lineBox = (
        _lineBody: Body,
        _lineShape: Line,
        _lineOffset: Vec2,
        _lineAngle: number,
        _boxBody: Body,
        _boxShape: Box,
        _boxOffset: Vec2,
        _boxAngle: number,
        _justTest = false
    ): number => {
        // TODO
        return 0
    }

    /**
     * Convex/Capsule Narrowphase.
     * @todo
     * @param convexBody
     * @param convexShape
     * @param convexPosition
     * @param convexAngle
     * @param capsuleBody
     * @param capsuleShape
     * @param capsulePosition
     * @param capsuleAngle
     * @param justTest
     * @returns
     */
    convexCapsule = (
        convexBody: Body,
        convexShape: Convex,
        convexPosition: Vec2,
        convexAngle: number,
        capsuleBody: Body,
        capsuleShape: Capsule,
        capsulePosition: Vec2,
        capsuleAngle: number,
        justTest = false
    ): number => {
        // Check the circles
        // Add offsets!
        const circlePos = convexCapsule_tempVec
        const halfLength = capsuleShape.length / 2
        vec2.set(circlePos, halfLength, 0)
        vec2.toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle)
        const result1 = this.circleConvex(
            capsuleBody,
            capsuleShape, // todo
            circlePos,
            capsuleAngle,
            convexBody,
            convexShape,
            convexPosition,
            convexAngle,
            justTest,
            capsuleShape.radius
        )

        vec2.set(circlePos, -halfLength, 0)
        vec2.toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle)
        const result2 = this.circleConvex(
            capsuleBody,
            capsuleShape, // todo
            circlePos,
            capsuleAngle,
            convexBody,
            convexShape,
            convexPosition,
            convexAngle,
            justTest,
            capsuleShape.radius
        )

        if (justTest && result1 + result2 !== 0) {
            return 1
        }

        // Check center rect
        const r = convexCapsule_tempRect
        setConvexToCapsuleShapeMiddle(r, capsuleShape)
        const result = this.convexConvex(
            convexBody,
            convexShape,
            convexPosition,
            convexAngle,
            capsuleBody,
            r,
            capsulePosition,
            capsuleAngle,
            justTest
        )

        return result + result1 + result2
    }

    /**
     * Line/Capsule Narrowphase.
     * @todo
     * @param _lineBody
     * @param _lineShape
     * @param _linePosition
     * @param _lineAngle
     * @param _capsuleBody
     * @param _capsuleShape
     * @param _capsulePosition
     * @param _capsuleAngle
     * @param _justTest
     * @returns
     */
    lineCapsule = (
        _lineBody: Body,
        _lineShape: Line,
        _linePosition: Vec2,
        _lineAngle: number,
        _capsuleBody: Body,
        _capsuleShape: Capsule,
        _capsulePosition: Vec2,
        _capsuleAngle: number,
        _justTest = false
    ): number => {
        // TODO
        return 0
    }

    /**
     * Capsule/Capsule Narrowphase.
     * @param bi
     * @param si
     * @param xi
     * @param ai
     * @param bj
     * @param sj
     * @param xj
     * @param aj
     * @param justTest
     * @returns
     */
    capsuleCapsule = (
        bi: Body,
        si: Capsule,
        xi: Vec2,
        ai: number,
        bj: Body,
        sj: Capsule,
        xj: Vec2,
        aj: number,
        justTest = false
    ): number => {
        // todo - was undefined
        let enableFrictionBefore = true

        // Check the circles
        // Add offsets!
        const circlePosi = capsuleCapsule_tempVec1
        const circlePosj = capsuleCapsule_tempVec2

        let numContacts = 0

        // Need 4 circle checks, between all
        for (let i = 0; i < 2; i++) {
            vec2.set(circlePosi, ((i === 0 ? -1 : 1) * si.length) / 2, 0)
            vec2.toGlobalFrame(circlePosi, circlePosi, xi, ai)

            for (let j = 0; j < 2; j++) {
                vec2.set(circlePosj, ((j === 0 ? -1 : 1) * sj.length) / 2, 0)
                vec2.toGlobalFrame(circlePosj, circlePosj, xj, aj)

                // Temporarily turn off friction
                if (this.enableFrictionReduction) {
                    enableFrictionBefore = this.enableFriction
                    this.enableFriction = false
                }

                const result = this.circleCircle(
                    bi,
                    si,
                    circlePosi,
                    ai,
                    bj,
                    sj,
                    circlePosj,
                    aj,
                    justTest,
                    si.radius,
                    sj.radius
                )

                if (this.enableFrictionReduction) {
                    this.enableFriction = enableFrictionBefore
                }

                if (justTest && result !== 0) {
                    return 1
                }

                numContacts += result
            }
        }

        if (this.enableFrictionReduction) {
            // Temporarily turn off friction
            enableFrictionBefore = this.enableFriction
            this.enableFriction = false
        }

        // Check circles against the center boxs
        const rect = capsuleCapsule_tempRect1
        setConvexToCapsuleShapeMiddle(rect, si)
        const result1 = this.convexCapsule(bi, rect, xi, ai, bj, sj, xj, aj, justTest)

        if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore
        }

        if (justTest && result1 !== 0) {
            return 1
        }
        numContacts += result1

        if (this.enableFrictionReduction) {
            // Temporarily turn off friction
            enableFrictionBefore = this.enableFriction
            this.enableFriction = false
        }

        setConvexToCapsuleShapeMiddle(rect, sj)
        const result2 = this.convexCapsule(bj, rect, xj, aj, bi, si, xi, ai, justTest)

        if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore
        }

        if (justTest && result2 !== 0) {
            return 1
        }
        numContacts += result2

        if (this.enableFrictionReduction) {
            if (numContacts && this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromAverage(numContacts))
            }
        }

        return numContacts
    }

    /**
     * Line/Line Narrowphase.
     * @todo
     * @param _bodyA
     * @param _shapeA
     * @param _positionA
     * @param _angleA
     * @param _bodyB
     * @param _shapeB
     * @param _positionB
     * @param _angleB
     * @param _justTest
     * @returns
     */
    lineLine = (
        _bodyA: Body,
        _shapeA: Line,
        _positionA: Vec2,
        _angleA: number,
        _bodyB: Body,
        _shapeB: Line,
        _positionB: Vec2,
        _angleB: number,
        _justTest = false
    ): number => {
        // TODO
        return 0
    }

    /**
     * Plane/line Narrowphase
     * @param planeBody
     * @param planeShape
     * @param planeOffset
     * @param planeAngle
     * @param lineBody
     * @param lineShape
     * @param lineOffset
     * @param lineAngle
     * @param justTest
     * @returns
     */
    planeLine = (
        planeBody: Body,
        planeShape: Plane,
        planeOffset: Vec2,
        planeAngle: number,
        lineBody: Body,
        lineShape: Line,
        lineOffset: Vec2,
        lineAngle: number,
        justTest = false
    ): number => {
        const worldVertex0 = tmp1
        const worldVertex1 = tmp2
        const worldVertex01 = tmp3
        const worldVertex11 = tmp4
        const worldEdge = tmp5
        const worldEdgeUnit = tmp6
        const dist = tmp7
        const worldNormal = tmp8
        const worldTangent = tmp9
        const verts = tmpArray
        let numContacts = 0

        // Get start and end points
        vec2.set(worldVertex0, -lineShape.length / 2, 0)
        vec2.set(worldVertex1, lineShape.length / 2, 0)

        // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
        vec2.toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle)
        vec2.toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle)

        vec2.copy(worldVertex0, worldVertex01)
        vec2.copy(worldVertex1, worldVertex11)

        // Get vector along the line
        vec2.sub(worldEdge, worldVertex1, worldVertex0)
        vec2.normalize(worldEdgeUnit, worldEdge)

        // Get tangent to the edge.
        vec2.rotate90cw(worldTangent, worldEdgeUnit)

        vec2.rotate(worldNormal, yAxis, planeAngle)

        // Check line ends
        verts[0] = worldVertex0
        verts[1] = worldVertex1
        for (let i = 0; i < verts.length; i++) {
            const v = verts[i]

            vec2.sub(dist, v, planeOffset)

            const d = vec2.dot(dist, worldNormal)

            if (d < 0) {
                if (justTest) {
                    return 1
                }

                const c = this.createContactEquation(planeBody, lineBody, planeShape, lineShape)
                numContacts++

                vec2.copy(c.normalA, worldNormal)
                vec2.normalize(c.normalA, c.normalA)

                // distance vector along plane normal
                vec2.scale(dist, worldNormal, d)

                // Vector from plane center to contact
                vec2.sub(c.contactPointA, v, dist)
                vec2.sub(c.contactPointA, c.contactPointA, planeBody.position)

                // From line center to contact
                vec2.sub(c.contactPointB, v, lineOffset)
                vec2.add(c.contactPointB, c.contactPointB, lineOffset)
                vec2.sub(c.contactPointB, c.contactPointB, lineBody.position)

                this.contactEquations.push(c)

                if (!this.enableFrictionReduction) {
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c))
                    }
                }
            }
        }

        if (justTest) {
            return 0
        }

        if (!this.enableFrictionReduction) {
            if (numContacts && this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromAverage(numContacts))
            }
        }

        return numContacts
    }

    /**
     * Particle/Capsule Narrowphase.
     * @param particleBody
     * @param particleShape
     * @param particlePosition
     * @param particleAngle
     * @param capsuleBody
     * @param capsuleShape
     * @param capsulePosition
     * @param capsuleAngle
     * @param justTest
     * @returns
     */
    particleCapsule = (
        particleBody: Body,
        particleShape: Particle,
        particlePosition: Vec2,
        particleAngle: number,
        capsuleBody: Body,
        capsuleShape: Capsule,
        capsulePosition: Vec2,
        capsuleAngle: number,
        justTest = false
    ): number => {
        return this.circleLine(
            particleBody,
            particleShape as Circle,
            particlePosition,
            particleAngle,
            capsuleBody,
            capsuleShape,
            capsulePosition,
            capsuleAngle,
            justTest,
            capsuleShape.radius,
            0
        )
    }

    /**
     * Circle/Line Narrowphase.
     * @param circleBody
     * @param circleShape
     * @param circleOffset
     * @param circleAngle
     * @param lineBody
     * @param lineShape
     * @param lineOffset
     * @param lineAngle
     * @param justTest If set to true, this function will return the result (intersection or not) without adding equations.
     * @param lineRadius Radius to add to the line. Can be used to test Capsules.
     * @param circleRadius If set, this value overrides the circle shape radius.
     * @returns
     */
    circleLine = (
        circleBody: Body,
        circleShape: Circle,
        circleOffset: Vec2,
        circleAngle: number,
        lineBody: Body,
        lineShape: Line,
        lineOffset: Vec2,
        lineAngle: number,
        justTest = false,
        lineRadius?: number,
        circleRadius?: number
    ): number => {
        lineRadius = lineRadius || 0
        circleRadius = circleRadius !== undefined ? circleRadius : circleShape.radius

        const orthoDist = tmp1
        const lineToCircleOrthoUnit = tmp2
        const projectedPoint = tmp3
        const centerDist = tmp4
        const worldTangent = tmp5
        const worldEdge = tmp6
        const worldEdgeUnit = tmp7
        const worldVertex0 = tmp8
        const worldVertex1 = tmp9
        const worldVertex01 = tmp10
        const worldVertex11 = tmp11
        const dist = tmp12
        const lineToCircle = tmp13
        const lineEndToLineRadius = tmp14
        const verts = tmpArray

        const halfLineLength = lineShape.length / 2

        // Get start and end points
        vec2.set(worldVertex0, -halfLineLength, 0)
        vec2.set(worldVertex1, halfLineLength, 0)

        // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
        vec2.toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle)
        vec2.toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle)

        vec2.copy(worldVertex0, worldVertex01)
        vec2.copy(worldVertex1, worldVertex11)

        // Get vector along the line
        vec2.sub(worldEdge, worldVertex1, worldVertex0)
        vec2.normalize(worldEdgeUnit, worldEdge)

        // Get tangent to the edge.
        vec2.rotate90cw(worldTangent, worldEdgeUnit)

        // Check distance from the plane spanned by the edge vs the circle
        vec2.sub(dist, circleOffset, worldVertex0)
        const d = vec2.dot(dist, worldTangent) // Distance from center of line to circle center
        vec2.sub(centerDist, worldVertex0, lineOffset)

        vec2.sub(lineToCircle, circleOffset, lineOffset)

        const radiusSum = circleRadius + lineRadius

        if (Math.abs(d) < radiusSum) {
            // Now project the circle onto the edge
            vec2.scale(orthoDist, worldTangent, d)
            vec2.sub(projectedPoint, circleOffset, orthoDist)

            // Add the missing line radius
            vec2.scale(lineToCircleOrthoUnit, worldTangent, vec2.dot(worldTangent, lineToCircle))
            vec2.normalize(lineToCircleOrthoUnit, lineToCircleOrthoUnit)
            vec2.scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius)
            vec2.add(projectedPoint, projectedPoint, lineToCircleOrthoUnit)

            // Check if the point is within the edge span
            const pos = vec2.dot(worldEdgeUnit, projectedPoint)
            const pos0 = vec2.dot(worldEdgeUnit, worldVertex0)
            const pos1 = vec2.dot(worldEdgeUnit, worldVertex1)

            if (pos > pos0 && pos < pos1) {
                // We got contact!

                if (justTest) {
                    return 1
                }

                const c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape)

                vec2.scale(c.normalA, orthoDist, -1)
                vec2.normalize(c.normalA, c.normalA)

                vec2.scale(c.contactPointA, c.normalA, circleRadius)
                vec2.add(c.contactPointA, c.contactPointA, circleOffset)
                vec2.sub(c.contactPointA, c.contactPointA, circleBody.position)

                vec2.sub(c.contactPointB, projectedPoint, lineOffset)
                vec2.add(c.contactPointB, c.contactPointB, lineOffset)
                vec2.sub(c.contactPointB, c.contactPointB, lineBody.position)

                this.contactEquations.push(c)

                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c))
                }

                return 1
            }
        }

        // Add corner
        verts[0] = worldVertex0
        verts[1] = worldVertex1

        for (let i = 0; i < verts.length; i++) {
            const v = verts[i]

            vec2.sub(dist, v, circleOffset)

            if (vec2.squaredLength(dist) < Math.pow(radiusSum, 2)) {
                if (justTest) {
                    return 1
                }

                const c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape)

                vec2.copy(c.normalA, dist)
                vec2.normalize(c.normalA, c.normalA)

                // Vector from circle to contact point is the normal times the circle radius
                vec2.scale(c.contactPointA, c.normalA, circleRadius)
                vec2.add(c.contactPointA, c.contactPointA, circleOffset)
                vec2.sub(c.contactPointA, c.contactPointA, circleBody.position)

                vec2.sub(c.contactPointB, v, lineOffset)
                vec2.scale(lineEndToLineRadius, c.normalA, -lineRadius)
                vec2.add(c.contactPointB, c.contactPointB, lineEndToLineRadius)
                vec2.add(c.contactPointB, c.contactPointB, lineOffset)
                vec2.sub(c.contactPointB, c.contactPointB, lineBody.position)

                this.contactEquations.push(c)

                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c))
                }

                return 1
            }
        }

        return 0
    }

    /**
     * Circle/Capsule Narrowphase.
     * @param bi
     * @param si
     * @param xi
     * @param ai
     * @param bj
     * @param sj
     * @param xj
     * @param aj
     * @param justTest
     * @returns
     */
    circleCapsule = (
        bi: Body,
        si: Circle,
        xi: Vec2,
        ai: number,
        bj: Body,
        sj: Capsule,
        xj: Vec2,
        aj: number,
        justTest = false
    ): number => {
        return this.circleLine(bi, si, xi, ai, bj, sj, xj, aj, justTest, si.radius, sj.radius)
    }

    /**
     * Circle/Convex Narrowphase.
     * @param circleBody
     * @param circleShape
     * @param circleOffset
     * @param circleAngle
     * @param convexBody
     * @param convexShape
     * @param convexOffset
     * @param convexAngle
     * @param justTest
     * @param circleRadius
     * @returns
     */
    circleConvex = (
        circleBody: Body,
        circleShape: Circle | Capsule,
        circleOffset: Vec2,
        circleAngle: number,
        convexBody: Body,
        convexShape: Convex,
        convexOffset: Vec2,
        convexAngle: number,
        justTest = false,
        circleRadius?: number
    ): number => {
        circleRadius = circleRadius !== undefined ? circleRadius : circleShape.radius

        const worldVertex0 = tmp1
        const worldVertex1 = tmp2
        const edge = tmp3
        const edgeUnit = tmp4
        const normal = tmp5
        const zero = tmp6
        const localCirclePosition = tmp7
        const r = tmp8
        const dist = tmp10
        const worldVertex = tmp11
        const closestEdgeProjectedPoint = tmp13
        const candidate = tmp14
        const candidateDist = tmp15
        let found = -1
        let minCandidateDistance = Number.MAX_VALUE

        vec2.set(zero, 0, 0)

        // New algorithm:
        // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
        // 2. For each edge
        // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
        // 2. 2. Check if point is inside.

        vec2.toLocalFrame(localCirclePosition, circleOffset, convexOffset, convexAngle)

        const vertices = convexShape.vertices
        const normals = convexShape.normals
        const numVertices = vertices.length
        let normalIndex = -1

        // Find the min separating edge.
        let separation = -Number.MAX_VALUE
        const radius = convexShape.boundingRadius + circleRadius

        for (let i = 0; i < numVertices; i++) {
            vec2.sub(r, localCirclePosition, vertices[i])
            const s = vec2.dot(normals[i], r)

            if (s > radius) {
                // Early out.
                return 0
            }

            if (s > separation) {
                separation = s
                normalIndex = i
            }
        }

        // Check edges first
        for (let i = normalIndex + numVertices - 1; i < normalIndex + numVertices + 2; i++) {
            const v0 = vertices[i % numVertices]
            const n = normals[i % numVertices]

            // Get point on circle, closest to the convex
            vec2.scale(candidate, n, -circleRadius)
            vec2.add(candidate, candidate, localCirclePosition)

            if (pointInConvexLocal(candidate, convexShape)) {
                vec2.sub(candidateDist, v0, candidate)
                const candidateDistance = Math.abs(vec2.dot(candidateDist, n))

                if (candidateDistance < minCandidateDistance) {
                    minCandidateDistance = candidateDistance
                    found = i
                }
            }
        }

        if (found !== -1) {
            if (justTest) {
                return 1
            }

            const v0 = vertices[found % numVertices]
            const v1 = vertices[(found + 1) % numVertices]

            vec2.toGlobalFrame(worldVertex0, v0, convexOffset, convexAngle)
            vec2.toGlobalFrame(worldVertex1, v1, convexOffset, convexAngle)

            vec2.sub(edge, worldVertex1, worldVertex0)

            vec2.normalize(edgeUnit, edge)

            // Get tangent to the edge. Points out of the Convex
            vec2.rotate90cw(normal, edgeUnit)

            // Get point on circle, closest to the convex
            vec2.scale(candidate, normal, -circleRadius)
            vec2.add(candidate, candidate, circleOffset)

            vec2.scale(closestEdgeProjectedPoint, normal, minCandidateDistance)
            vec2.add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, candidate)

            const c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape)
            vec2.sub(c.normalA, candidate, circleOffset)
            vec2.normalize(c.normalA, c.normalA)

            vec2.scale(c.contactPointA, c.normalA, circleRadius)
            vec2.add(c.contactPointA, c.contactPointA, circleOffset)
            vec2.sub(c.contactPointA, c.contactPointA, circleBody.position)

            vec2.sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset)
            vec2.add(c.contactPointB, c.contactPointB, convexOffset)
            vec2.sub(c.contactPointB, c.contactPointB, convexBody.position)

            this.contactEquations.push(c)

            if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c))
            }

            return 1
        }

        // Check closest vertices
        if (circleRadius > 0 && normalIndex !== -1) {
            for (let i = normalIndex + numVertices; i < normalIndex + numVertices + 2; i++) {
                const localVertex = vertices[i % numVertices]

                vec2.sub(dist, localVertex, localCirclePosition)

                if (vec2.squaredLength(dist) < circleRadius * circleRadius) {
                    if (justTest) {
                        return 1
                    }

                    vec2.toGlobalFrame(worldVertex, localVertex, convexOffset, convexAngle)
                    vec2.sub(dist, worldVertex, circleOffset)

                    const c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape)

                    vec2.copy(c.normalA, dist)
                    vec2.normalize(c.normalA, c.normalA)

                    // Vector from circle to contact point is the normal times the circle radius
                    vec2.scale(c.contactPointA, c.normalA, circleRadius)
                    vec2.add(c.contactPointA, c.contactPointA, circleOffset)
                    vec2.sub(c.contactPointA, c.contactPointA, circleBody.position)

                    vec2.sub(c.contactPointB, worldVertex, convexOffset)
                    vec2.add(c.contactPointB, c.contactPointB, convexOffset)
                    vec2.sub(c.contactPointB, c.contactPointB, convexBody.position)

                    this.contactEquations.push(c)

                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c))
                    }

                    return 1
                }
            }
        }

        return 0
    }

    /**
     * Particle/Convex Narrowphase.
     * @param particleBody
     * @param particleShape
     * @param particleOffset
     * @param particleAngle
     * @param convexBody
     * @param convexShape
     * @param convexOffset
     * @param convexAngle
     * @param justTest
     * @returns
     */
    particleConvex = (
        particleBody: Body,
        particleShape: Particle,
        particleOffset: Vec2,
        particleAngle: number,
        convexBody: Body,
        convexShape: Convex,
        convexOffset: Vec2,
        convexAngle: number,
        justTest = false
    ): number => {
        const worldVertex0 = tmp1
        const worldVertex1 = tmp2
        const worldEdge = tmp3
        const worldEdgeUnit = tmp4
        const worldTangent = tmp5
        const centerDist = tmp6
        const convexToparticle = tmp7
        const closestEdgeProjectedPoint = tmp13
        const candidateDist = tmp14
        const minEdgeNormal = tmp15
        const verts = convexShape.vertices
        let minCandidateDistance = Number.MAX_VALUE
        let found = false

        // Check if the particle is in the polygon at all
        if (!pointInConvex(particleOffset, convexShape, convexOffset, convexAngle)) {
            return 0
        }

        if (justTest) {
            return 1
        }

        // Check edges first
        for (let i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
            const v0 = verts[i % numVerts],
                v1 = verts[(i + 1) % numVerts]

            // Transform vertices to world
            // @todo transform point to local space instead
            vec2.rotate(worldVertex0, v0, convexAngle)
            vec2.rotate(worldVertex1, v1, convexAngle)
            vec2.add(worldVertex0, worldVertex0, convexOffset)
            vec2.add(worldVertex1, worldVertex1, convexOffset)

            // Get world edge
            vec2.sub(worldEdge, worldVertex1, worldVertex0)
            vec2.normalize(worldEdgeUnit, worldEdge)

            // Get tangent to the edge. Points out of the Convex
            vec2.rotate90cw(worldTangent, worldEdgeUnit)

            // Check distance from the infinite line (spanned by the edge) to the particle
            vec2.sub(centerDist, worldVertex0, convexOffset)

            vec2.sub(convexToparticle, particleOffset, convexOffset)

            vec2.sub(candidateDist, worldVertex0, particleOffset)
            const candidateDistance = Math.abs(vec2.dot(candidateDist, worldTangent))

            if (candidateDistance < minCandidateDistance) {
                minCandidateDistance = candidateDistance
                vec2.scale(closestEdgeProjectedPoint, worldTangent, candidateDistance)
                vec2.add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, particleOffset)
                vec2.copy(minEdgeNormal, worldTangent)
                found = true
            }
        }

        if (found) {
            const c = this.createContactEquation(particleBody, convexBody, particleShape, convexShape)

            vec2.scale(c.normalA, minEdgeNormal, -1)
            vec2.normalize(c.normalA, c.normalA)

            // Particle has no extent to the contact point
            vec2.set(c.contactPointA, 0, 0)
            vec2.add(c.contactPointA, c.contactPointA, particleOffset)
            vec2.sub(c.contactPointA, c.contactPointA, particleBody.position)

            // From convex center to point
            vec2.sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset)
            vec2.add(c.contactPointB, c.contactPointB, convexOffset)
            vec2.sub(c.contactPointB, c.contactPointB, convexBody.position)

            this.contactEquations.push(c)

            if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c))
            }

            return 1
        }

        return 0
    }

    /**
     * Circle/Circle Narrowphase.
     * @param bodyA
     * @param shapeA
     * @param offsetA
     * @param angleA
     * @param bodyB
     * @param shapeB
     * @param offsetB
     * @param angleB
     * @param justTest
     * @param radiusA
     * @param radiusB
     * @returns
     */
    circleCircle = (
        bodyA: Body,
        shapeA: Circle | Capsule,
        offsetA: Vec2,
        angleA: number,
        bodyB: Body,
        shapeB: Circle | Capsule,
        offsetB: Vec2,
        angleB: number,
        justTest = false,
        radiusA?: number,
        radiusB?: number
    ): number => {
        const dist = tmp1
        radiusA = radiusA || shapeA.radius
        radiusB = radiusB || shapeB.radius

        vec2.sub(dist, offsetA, offsetB)
        const r = radiusA + radiusB
        if (vec2.squaredLength(dist) > r * r) {
            return 0
        }

        if (justTest) {
            return 1
        }

        const c = this.createContactEquation(bodyA, bodyB, shapeA, shapeB)
        const cpA = c.contactPointA
        const cpB = c.contactPointB
        const normalA = c.normalA

        vec2.sub(normalA, offsetB, offsetA)
        vec2.normalize(normalA, normalA)

        vec2.scale(cpA, normalA, radiusA)
        vec2.scale(cpB, normalA, -radiusB)

        addsubtract(cpA, cpA, offsetA, bodyA.position)
        addsubtract(cpB, cpB, offsetB, bodyB.position)

        this.contactEquations.push(c)

        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c))
        }
        return 1
    }

    /**
     * Plane/Convex Narrowphase.
     * @param planeBody
     * @param planeShape
     * @param planeOffset
     * @param planeAngle
     * @param convexBody
     * @param convexShape
     * @param convexOffset
     * @param convexAngle
     * @param justTest
     * @returns
     * @todo only use the deepest contact point + the contact point furthest away from it
     */
    planeConvex = (
        planeBody: Body,
        planeShape: Plane,
        planeOffset: Vec2,
        planeAngle: number,
        convexBody: Body,
        convexShape: Convex,
        convexOffset: Vec2,
        convexAngle: number,
        justTest = false
    ): number => {
        const worldVertex = tmp1
        const worldNormal = tmp2
        const dist = tmp3
        const localPlaneOffset = tmp4
        const localPlaneNormal = tmp5
        const localDist = tmp6

        let numReported = 0
        vec2.rotate(worldNormal, yAxis, planeAngle)

        // Get convex-local plane offset and normal
        vec2.vectorToLocalFrame(localPlaneNormal, worldNormal, convexAngle)
        vec2.toLocalFrame(localPlaneOffset, planeOffset, convexOffset, convexAngle)

        const vertices = convexShape.vertices
        for (let i = 0, numVerts = vertices.length; i !== numVerts; i++) {
            const v = vertices[i]

            vec2.sub(localDist, v, localPlaneOffset)

            if (vec2.dot(localDist, localPlaneNormal) <= 0) {
                if (justTest) {
                    return 1
                }

                vec2.toGlobalFrame(worldVertex, v, convexOffset, convexAngle)

                vec2.sub(dist, worldVertex, planeOffset)

                // Found vertex
                numReported++

                const c = this.createContactEquation(planeBody, convexBody, planeShape, convexShape)

                vec2.sub(dist, worldVertex, planeOffset)

                vec2.copy(c.normalA, worldNormal)

                const d = vec2.dot(dist, c.normalA)
                vec2.scale(dist, c.normalA, d)

                // rj is from convex center to contact
                vec2.sub(c.contactPointB, worldVertex, convexBody.position)

                // ri is from plane center to contact
                vec2.sub(c.contactPointA, worldVertex, dist)
                vec2.sub(c.contactPointA, c.contactPointA, planeBody.position)

                this.contactEquations.push(c)

                if (!this.enableFrictionReduction) {
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c))
                    }
                }
            }
        }

        if (this.enableFrictionReduction) {
            if (this.enableFriction && numReported) {
                this.frictionEquations.push(this.createFrictionFromAverage(numReported))
            }
        }

        return numReported
    }

    /**
     * Particle/Plane Narrowphase.
     * @param particleBody
     * @param particleShape
     * @param particleOffset
     * @param particleAngle
     * @param planeBody
     * @param planeShape
     * @param planeOffset
     * @param planeAngle
     * @param justTest
     * @returns
     */
    particlePlane = (
        particleBody: Body,
        particleShape: Particle,
        particleOffset: Vec2,
        particleAngle: number,
        planeBody: Body,
        planeShape: Plane,
        planeOffset: Vec2,
        planeAngle: number,
        justTest = false
    ): number => {
        const dist = tmp1,
            worldNormal = tmp2

        planeAngle = planeAngle || 0

        vec2.sub(dist, particleOffset, planeOffset)
        vec2.rotate(worldNormal, yAxis, planeAngle)

        const d = vec2.dot(dist, worldNormal)

        if (d > 0) {
            return 0
        }
        if (justTest) {
            return 1
        }

        const c = this.createContactEquation(planeBody, particleBody, planeShape, particleShape)

        vec2.copy(c.normalA, worldNormal)
        vec2.scale(dist, c.normalA, d)
        // dist is now the distance vector in the normal direction

        // ri is the particle position projected down onto the plane, from the plane center
        vec2.sub(c.contactPointA, particleOffset, dist)
        vec2.sub(c.contactPointA, c.contactPointA, planeBody.position)

        // rj is from the body center to the particle center
        vec2.sub(c.contactPointB, particleOffset, particleBody.position)

        this.contactEquations.push(c)

        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c))
        }
        return 1
    }

    circleParticle = (
        circleBody: Body,
        circleShape: Circle,
        circleOffset: Vec2,
        circleAngle: number,
        particleBody: Body,
        particleShape: Particle,
        particleOffset: Vec2,
        particleAngle: number,
        justTest = false
    ): number => {
        const dist = tmp1
        const circleRadius = circleShape.radius

        vec2.sub(dist, particleOffset, circleOffset)
        if (vec2.squaredLength(dist) > circleRadius * circleRadius) {
            return 0
        }
        if (justTest) {
            return 1
        }

        const c = this.createContactEquation(circleBody, particleBody, circleShape, particleShape)
        const normalA = c.normalA
        const contactPointA = c.contactPointA
        const contactPointB = c.contactPointB

        vec2.copy(normalA, dist)
        vec2.normalize(normalA, normalA)

        // Vector from circle to contact point is the normal times the circle radius
        vec2.scale(contactPointA, normalA, circleRadius)
        vec2.add(contactPointA, contactPointA, circleOffset)
        vec2.sub(contactPointA, contactPointA, circleBody.position)

        // Vector from particle center to contact point is zero
        vec2.sub(contactPointB, particleOffset, particleBody.position)

        this.contactEquations.push(c)

        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c))
        }

        return 1
    }

    /**
     * Plane/Capsule Narrowphase.
     * @param planeBody
     * @param planeShape
     * @param planeOffset
     * @param planeAngle
     * @param capsuleBody
     * @param capsuleShape
     * @param capsuleOffset
     * @param capsuleAngle
     * @param justTest
     * @returns
     */
    planeCapsule = (
        planeBody: Body,
        planeShape: Plane,
        planeOffset: Vec2,
        planeAngle: number,
        capsuleBody: Body,
        capsuleShape: Capsule,
        capsuleOffset: Vec2,
        capsuleAngle: number,
        justTest = false
    ): number => {
        const end1 = planeCapsule_tmp1,
            end2 = planeCapsule_tmp2,
            circle = planeCapsule_tmpCircle,
            halfLength = capsuleShape.length / 2

        // Compute world end positions
        vec2.set(end1, -halfLength, 0)
        vec2.set(end2, halfLength, 0)
        vec2.toGlobalFrame(end1, end1, capsuleOffset, capsuleAngle)
        vec2.toGlobalFrame(end2, end2, capsuleOffset, capsuleAngle)

        circle.radius = capsuleShape.radius

        // todo - was undefined
        let enableFrictionBefore = true

        // Temporarily turn off friction
        if (this.enableFrictionReduction) {
            enableFrictionBefore = this.enableFriction
            this.enableFriction = false
        }

        // Do Narrowphase as two circles
        const numContacts1 = this.circlePlane(
                capsuleBody,
                circle,
                end1,
                0,
                planeBody,
                planeShape,
                planeOffset,
                planeAngle,
                justTest
            ),
            numContacts2 = this.circlePlane(
                capsuleBody,
                circle,
                end2,
                0,
                planeBody,
                planeShape,
                planeOffset,
                planeAngle,
                justTest
            )

        // Restore friction
        if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore
        }

        if (justTest) {
            return numContacts1 + numContacts2
        } else {
            const numTotal = numContacts1 + numContacts2
            if (this.enableFrictionReduction) {
                if (numTotal) {
                    this.frictionEquations.push(this.createFrictionFromAverage(numTotal))
                }
            }
            return numTotal
        }
    }

    /**
     * Circle/Plane Narrowphase
     * @param circleBody
     * @param circleShape
     * @param circleOffset
     * @param circleAngle
     * @param planeBody
     * @param planeShape
     * @param planeOffset
     * @param planeAngle
     * @param justTest
     * @returns
     */
    circlePlane = (
        circleBody: Body,
        circleShape: Circle,
        circleOffset: Vec2,
        circleAngle: number,
        planeBody: Body,
        planeShape: Plane,
        planeOffset: Vec2,
        planeAngle: number,
        justTest = false
    ): number => {
        const circleRadius = circleShape.radius

        // Vector from plane to circle
        const planeToCircle = tmp1,
            worldNormal = tmp2,
            temp = tmp3

        vec2.sub(planeToCircle, circleOffset, planeOffset)

        // World plane normal
        vec2.rotate(worldNormal, yAxis, planeAngle)

        // Normal direction distance
        const d = vec2.dot(worldNormal, planeToCircle)

        if (d > circleRadius) {
            return 0 // No overlap. Abort.
        }

        if (justTest) {
            return 1
        }

        // Create contact
        const contact = this.createContactEquation(planeBody, circleBody, planeShape, circleShape)

        // ni is the plane world normal
        vec2.copy(contact.normalA, worldNormal)

        // rj is the vector from circle center to the contact point
        const cpB = contact.contactPointB
        vec2.scale(cpB, contact.normalA, -circleRadius)
        vec2.add(cpB, cpB, circleOffset)
        vec2.sub(cpB, cpB, circleBody.position)

        // ri is the distance from plane center to contact.
        const cpA = contact.contactPointA
        vec2.scale(temp, contact.normalA, d)
        vec2.sub(cpA, planeToCircle, temp) // Subtract normal distance vector from the distance vector
        vec2.add(cpA, cpA, planeOffset)
        vec2.sub(cpA, cpA, planeBody.position)

        this.contactEquations.push(contact)

        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(contact))
        }

        return 1
    }

    /**
     * Convex/Convex Narrowphase.
     * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
     * @param bodyA
     * @param polyA
     * @param positionA
     * @param angleA
     * @param bodyB
     * @param polyB
     * @param positionB
     * @param angleB
     * @param justTest
     * @returns
     */
    convexConvex = (
        bodyA: Body,
        polyA: Convex,
        positionA: Vec2,
        angleA: number,
        bodyB: Body,
        polyB: Convex,
        positionB: Vec2,
        angleB: number,
        justTest = false
    ): number => {
        const totalRadius = 0
        const dist = collidePolygons_dist

        const tempVec = collidePolygons_tempVec
        const tmpVec = collidePolygons_tmpVec

        const edgeA = findMaxSeparation(tempVec, polyA, positionA, angleA, polyB, positionB, angleB)
        const separationA = tempVec[0]
        if (separationA > totalRadius) {
            return 0
        }

        const edgeB = findMaxSeparation(tmpVec, polyB, positionB, angleB, polyA, positionA, angleA)
        const separationB = tmpVec[0]
        if (separationB > totalRadius) {
            return 0
        }

        let poly1 // reference polygon
        let poly2 // incident polygon

        let position1
        let position2
        let angle1
        let angle2
        let body1
        let body2

        let edge1 // reference edge

        if (separationB > separationA) {
            poly1 = polyB
            poly2 = polyA
            body1 = bodyB
            body2 = bodyA
            position1 = positionB
            angle1 = angleB
            position2 = positionA
            angle2 = angleA
            edge1 = edgeB
        } else {
            poly1 = polyA
            poly2 = polyB
            body1 = bodyA
            body2 = bodyB
            position1 = positionA
            angle1 = angleA
            position2 = positionB
            angle2 = angleB
            edge1 = edgeA
        }

        const incidentEdge = collidePolygons_incidentEdge
        findIncidentEdge(incidentEdge, poly1, position1, angle1, edge1, poly2, position2, angle2)

        const count1 = poly1.vertices.length
        const vertices1 = poly1.vertices

        const iv1 = edge1
        const iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0

        const v11 = collidePolygons_v11
        const v12 = collidePolygons_v12
        vec2.copy(v11, vertices1[iv1])
        vec2.copy(v12, vertices1[iv2])

        const localTangent = collidePolygons_localTangent
        vec2.sub(localTangent, v12, v11)
        vec2.normalize(localTangent, localTangent)

        const localNormal = collidePolygons_localNormal
        vec2.crossVZ(localNormal, localTangent, 1.0)
        const planePoint = collidePolygons_planePoint
        vec2.add(planePoint, v11, v12)
        vec2.scale(planePoint, planePoint, 0.5)

        const tangent = collidePolygons_tangent // tangent in world space
        vec2.rotate(tangent, localTangent, angle1)
        const normal = collidePolygons_normal // normal in world space
        vec2.crossVZ(normal, tangent, 1.0)

        vec2.toGlobalFrame(v11, v11, position1, angle1)
        vec2.toGlobalFrame(v12, v12, position1, angle1)

        // Face offset.
        const frontOffset = vec2.dot(normal, v11)

        // Side offsets, extended by polytope skin thickness.
        const sideOffset1 = -vec2.dot(tangent, v11) + totalRadius
        const sideOffset2 = vec2.dot(tangent, v12) + totalRadius

        // Clip incident edge against extruded edge1 side edges.
        const clipPoints1 = collidePolygons_clipPoints1
        const clipPoints2 = collidePolygons_clipPoints2
        let np = 0

        // Clip to box side 1
        const negativeTangent = collidePolygons_negativeTangent
        vec2.scale(negativeTangent, tangent, -1)
        np = clipSegmentToLine(clipPoints1, incidentEdge, negativeTangent, sideOffset1)

        if (np < 2) {
            return 0
        }

        // Clip to negative box side 1
        np = clipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2)

        if (np < 2) {
            return 0
        }

        let pointCount = 0
        for (let i = 0; i < maxManifoldPoints; ++i) {
            const separation = vec2.dot(normal, clipPoints2[i]) - frontOffset

            if (separation <= totalRadius) {
                if (justTest) {
                    return 1
                }

                ++pointCount

                const c = this.createContactEquation(body1, body2, poly1, poly2)

                vec2.copy(c.normalA, normal)
                vec2.copy(c.contactPointB, clipPoints2[i])
                vec2.sub(c.contactPointB, c.contactPointB, body2.position)

                vec2.scale(dist, normal, -separation)
                vec2.add(c.contactPointA, clipPoints2[i], dist)
                vec2.sub(c.contactPointA, c.contactPointA, body1.position)

                this.contactEquations.push(c)

                if (this.enableFriction && !this.enableFrictionReduction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c))
                }
            }
        }

        if (pointCount && this.enableFrictionReduction && this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromAverage(pointCount))
        }

        return pointCount
    }

    /**
     * Circle/Heightfield Narrowphase.
     * @param circleBody
     * @param circleShape
     * @param circlePos
     * @param circleAngle
     * @param hfBody
     * @param hfShape
     * @param hfPos
     * @param hfAngle
     * @param justTest
     * @param radius
     * @returns
     */
    circleHeightfield = (
        circleBody: Body,
        circleShape: Circle,
        circlePos: Vec2,
        circleAngle: number,
        hfBody: Body,
        hfShape: Heightfield,
        hfPos: Vec2,
        hfAngle: number,
        justTest = false,
        radius?: number
    ): number => {
        radius = radius || circleShape.radius

        const data = hfShape.heights
        const w = hfShape.elementWidth
        const dist = circleHeightfield_dist
        const candidate = circleHeightfield_candidate
        const minCandidate = circleHeightfield_minCandidate
        const minCandidateNormal = circleHeightfield_minCandidateNormal
        const worldNormal = circleHeightfield_worldNormal
        const v0 = circleHeightfield_v0
        const v1 = circleHeightfield_v1

        // Get the index of the points to test against
        let idxA = Math.floor((circlePos[0] - radius - hfPos[0]) / w),
            idxB = Math.ceil((circlePos[0] + radius - hfPos[0]) / w)

        /*if(idxB < 0 || idxA >= data.length)
            return justTest ? false : 0;*/

        if (idxA < 0) {
            idxA = 0
        }
        if (idxB >= data.length) {
            idxB = data.length - 1
        }

        // Get max and min
        let max = data[idxA],
            min = data[idxB]
        for (let i = idxA; i < idxB; i++) {
            if (data[i] < min) {
                min = data[i]
            }
            if (data[i] > max) {
                max = data[i]
            }
        }

        if (circlePos[1] - radius > max) {
            return 0
        }

        /*
        if(circlePos[1]+radius < min){
            // Below the minimum point... We can just guess.
            // TODO
        }
        */

        // 1. Check so center of circle is not inside the field. If it is, this wont work...
        // 2. For each edge
        // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
        // 2. 2. Check if point is inside.

        let found = false

        // Check all edges first
        for (let i = idxA; i < idxB; i++) {
            // Get points
            vec2.set(v0, i * w, data[i])
            vec2.set(v1, (i + 1) * w, data[i + 1])
            vec2.add(v0, v0, hfPos) // @todo transform circle to local heightfield space instead
            vec2.add(v1, v1, hfPos)

            // Get normal
            vec2.sub(worldNormal, v1, v0)
            vec2.rotate(worldNormal, worldNormal, Math.PI / 2)
            vec2.normalize(worldNormal, worldNormal)

            // Get point on circle, closest to the edge
            vec2.scale(candidate, worldNormal, -radius)
            vec2.add(candidate, candidate, circlePos)

            // Distance from v0 to the candidate point
            vec2.sub(dist, candidate, v0)

            // Check if it is in the element "stick"
            const d = vec2.dot(dist, worldNormal)
            if (candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0) {
                if (justTest) {
                    return 1
                }

                found = true

                // Store the candidate point, projected to the edge
                vec2.scale(dist, worldNormal, -d)
                vec2.add(minCandidate, candidate, dist)
                vec2.copy(minCandidateNormal, worldNormal)

                const c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape)

                // Normal is out of the heightfield
                vec2.copy(c.normalA, minCandidateNormal)

                // Vector from circle to heightfield
                vec2.scale(c.contactPointB, c.normalA, -radius)
                vec2.add(c.contactPointB, c.contactPointB, circlePos)
                vec2.sub(c.contactPointB, c.contactPointB, circleBody.position)

                vec2.copy(c.contactPointA, minCandidate)
                vec2.sub(c.contactPointA, c.contactPointA, hfBody.position)

                this.contactEquations.push(c)

                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c))
                }
            }
        }

        // Check all vertices
        found = false
        if (radius > 0) {
            for (let i = idxA; i <= idxB; i++) {
                // Get point
                vec2.set(v0, i * w, data[i])
                vec2.add(v0, v0, hfPos)

                vec2.sub(dist, circlePos, v0)

                if (vec2.squaredLength(dist) < Math.pow(radius, 2)) {
                    if (justTest) {
                        return 1
                    }

                    found = true

                    const c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape)

                    // Construct normal - out of heightfield
                    vec2.copy(c.normalA, dist)
                    vec2.normalize(c.normalA, c.normalA)

                    vec2.scale(c.contactPointB, c.normalA, -radius)
                    vec2.add(c.contactPointB, c.contactPointB, circlePos)
                    vec2.sub(c.contactPointB, c.contactPointB, circleBody.position)

                    vec2.sub(c.contactPointA, v0, hfPos)
                    vec2.add(c.contactPointA, c.contactPointA, hfPos)
                    vec2.sub(c.contactPointA, c.contactPointA, hfBody.position)

                    this.contactEquations.push(c)

                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c))
                    }
                }
            }
        }

        if (found) {
            return 1
        }

        return 0
    }

    /**
     * Convex/Heightfield Narrowphase.
     * @param convexBody
     * @param convexShape
     * @param convexPos
     * @param convexAngle
     * @param hfBody
     * @param hfShape
     * @param hfPos
     * @param hfAngle
     * @param justTest
     * @returns
     */
    convexHeightfield = (
        convexBody: Body,
        convexShape: Convex,
        convexPos: Vec2,
        convexAngle: number,
        hfBody: Body,
        hfShape: Heightfield,
        hfPos: Vec2,
        hfAngle: number,
        justTest = false
    ): number => {
        const data = hfShape.heights,
            w = hfShape.elementWidth,
            v0 = convexHeightfield_v0,
            v1 = convexHeightfield_v1,
            tilePos = convexHeightfield_tilePos,
            tileConvex = convexHeightfield_tempConvexShape

        // Get the index of the points to test against
        let idxA = Math.floor((convexBody.aabb.lowerBound[0] - hfPos[0]) / w),
            idxB = Math.ceil((convexBody.aabb.upperBound[0] - hfPos[0]) / w)

        if (idxA < 0) {
            idxA = 0
        }
        if (idxB >= data.length) {
            idxB = data.length - 1
        }

        // Get max and min
        let max = data[idxA],
            min = data[idxB]
        for (let i = idxA; i < idxB; i++) {
            if (data[i] < min) {
                min = data[i]
            }
            if (data[i] > max) {
                max = data[i]
            }
        }

        if (convexBody.aabb.lowerBound[1] > max) {
            return 0
        }

        let numContacts = 0

        // Loop over all edges
        // @todo If possible, construct a convex from several data points (need o check if the points make a convex shape)
        // @todo transform convex to local heightfield space.
        // @todo bail out if the heightfield tile is not tall enough.
        for (let i = idxA; i < idxB; i++) {
            // Get points
            vec2.set(v0, i * w, data[i])
            vec2.set(v1, (i + 1) * w, data[i + 1])
            vec2.add(v0, v0, hfPos)
            vec2.add(v1, v1, hfPos)

            // Construct a convex
            const tileHeight = 100 // todo
            vec2.set(tilePos, (v1[0] + v0[0]) * 0.5, (v1[1] + v0[1] - tileHeight) * 0.5)

            vec2.sub(tileConvex.vertices[0], v1, tilePos)
            vec2.sub(tileConvex.vertices[1], v0, tilePos)
            vec2.copy(tileConvex.vertices[2], tileConvex.vertices[1])
            vec2.copy(tileConvex.vertices[3], tileConvex.vertices[0])
            tileConvex.vertices[2][1] -= tileHeight
            tileConvex.vertices[3][1] -= tileHeight
            tileConvex.updateNormals()

            // Do convex collision
            numContacts += this.convexConvex(
                convexBody,
                convexShape,
                convexPos,
                convexAngle,
                hfBody,
                tileConvex,
                tilePos,
                0,
                justTest
            )
        }

        return numContacts
    }

    narrowphases = {
        [Shape.CONVEX | Shape.LINE]: this.convexLine,
        [Shape.LINE | Shape.BOX]: this.lineBox,
        [Shape.CONVEX | Shape.CAPSULE]: this.convexCapsule,
        [Shape.BOX | Shape.CAPSULE]: this.convexCapsule,
        [Shape.LINE | Shape.CAPSULE]: this.lineCapsule,
        [Shape.CAPSULE]: this.capsuleCapsule,
        [Shape.LINE]: this.capsuleCapsule,
        [Shape.PLANE | Shape.LINE]: this.planeLine,
        [Shape.PARTICLE | Shape.CAPSULE]: this.particleCapsule,
        [Shape.CIRCLE | Shape.LINE]: this.circleLine,
        [Shape.CIRCLE | Shape.CAPSULE]: this.circleCapsule,
        [Shape.CIRCLE | Shape.CONVEX]: this.circleConvex,
        [Shape.CIRCLE | Shape.BOX]: this.circleConvex,
        [Shape.PARTICLE | Shape.CONVEX]: this.particleConvex,
        [Shape.PARTICLE | Shape.BOX]: this.particleConvex,
        [Shape.CIRCLE]: this.circleCircle,
        [Shape.PLANE | Shape.CONVEX]: this.planeConvex,
        [Shape.PLANE | Shape.BOX]: this.planeConvex,
        [Shape.PARTICLE | Shape.PLANE]: this.particlePlane,
        [Shape.CIRCLE | Shape.PARTICLE]: this.circleParticle,
        [Shape.PLANE | Shape.CAPSULE]: this.planeCapsule,
        [Shape.CIRCLE | Shape.PLANE]: this.circlePlane,
        [Shape.CONVEX]: this.convexConvex,
        [Shape.CONVEX | Shape.BOX]: this.convexConvex,
        [Shape.BOX]: this.convexConvex,
        [Shape.CIRCLE | Shape.HEIGHTFIELD]: this.circleHeightfield,
        [Shape.BOX | Shape.HEIGHTFIELD]: this.convexHeightfield,
        [Shape.CONVEX | Shape.HEIGHTFIELD]: this.convexHeightfield,
    }
}

// Temp things
const yAxis = vec2.fromValues(0, 1)
const tmp1 = vec2.create()
const tmp2 = vec2.create()
const tmp3 = vec2.create()
const tmp4 = vec2.create()
const tmp5 = vec2.create()
const tmp6 = vec2.create()
const tmp7 = vec2.create()
const tmp8 = vec2.create()
const tmp9 = vec2.create()
const tmp10 = vec2.create()
const tmp11 = vec2.create()
const tmp12 = vec2.create()
const tmp13 = vec2.create()
const tmp14 = vec2.create()
const tmp15 = vec2.create()
const tmpArray: Vec2[] = []

const bodiesOverlap_shapePositionA = vec2.create()
const bodiesOverlap_shapePositionB = vec2.create()

// Find edge normal of max separation on A - return if separating axis is found
// Find edge normal of max separation on B - return if separation axis is found
// Choose reference edge as min(minA, minB)
// Find incident edge
// Clip
// The normal points from 1 to 2
const collidePolygons_tempVec = vec2.create()
const collidePolygons_tmpVec = vec2.create()
const collidePolygons_localTangent = vec2.create()
const collidePolygons_localNormal = vec2.create()
const collidePolygons_planePoint = vec2.create()
const collidePolygons_tangent = vec2.create()
const collidePolygons_normal = vec2.create()
const collidePolygons_negativeTangent = vec2.create()
const collidePolygons_v11 = vec2.create()
const collidePolygons_v12 = vec2.create()
const collidePolygons_dist = vec2.create()
const collidePolygons_clipPoints1 = [vec2.create(), vec2.create()]
const collidePolygons_clipPoints2 = [vec2.create(), vec2.create()]
const collidePolygons_incidentEdge = [vec2.create(), vec2.create()]
const maxManifoldPoints = 2

const circleHeightfield_candidate = vec2.create()
const circleHeightfield_dist = vec2.create()
const circleHeightfield_v0 = vec2.create()
const circleHeightfield_v1 = vec2.create()
const circleHeightfield_minCandidate = vec2.create()
const circleHeightfield_worldNormal = vec2.create()
const circleHeightfield_minCandidateNormal = vec2.create()

function setConvexToCapsuleShapeMiddle(convexShape: Convex, capsuleShape: Capsule): void {
    const capsuleRadius = capsuleShape.radius
    const halfCapsuleLength = capsuleShape.length * 0.5
    const verts = convexShape.vertices
    vec2.set(verts[0], -halfCapsuleLength, -capsuleRadius)
    vec2.set(verts[1], halfCapsuleLength, -capsuleRadius)
    vec2.set(verts[2], halfCapsuleLength, capsuleRadius)
    vec2.set(verts[3], -halfCapsuleLength, capsuleRadius)
}

const convexCapsule_tempRect = new Box({ width: 1, height: 1 })
const convexCapsule_tempVec = vec2.create()

const capsuleCapsule_tempVec1 = vec2.create()
const capsuleCapsule_tempVec2 = vec2.create()
const capsuleCapsule_tempRect1 = new Box({ width: 1, height: 1 })

const pic_localPoint = vec2.create()
const pic_r0 = vec2.create()
const pic_r1 = vec2.create()

/*
 * Check if a point is in a polygon
 */
function pointInConvex(worldPoint: Vec2, convexShape: Convex, convexOffset: Vec2, convexAngle: number): boolean {
    const localPoint = pic_localPoint
    const r0 = pic_r0
    const r1 = pic_r1
    const verts = convexShape.vertices
    let lastCross = null

    vec2.toLocalFrame(localPoint, worldPoint, convexOffset, convexAngle)

    for (let i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
        const v0 = verts[i % numVerts],
            v1 = verts[(i + 1) % numVerts]

        vec2.sub(r0, v0, localPoint)
        vec2.sub(r1, v1, localPoint)

        const cross = vec2.crossLength(r0, r1)

        if (lastCross === null) {
            lastCross = cross
        }

        // If we got a different sign of the distance vector, the point is out of the polygon
        if (cross * lastCross < 0) {
            return false
        }
        lastCross = cross
    }
    return true
}

function addsubtract(out: Vec2, a: Vec2, b: Vec2, c: Vec2): void {
    out[0] = a[0] + b[0] - c[0]
    out[1] = a[1] + b[1] - c[1]
}

/*
 * Check if a point is in a polygon
 */
function pointInConvexLocal(localPoint: Vec2, convexShape: Convex) {
    const r0 = pic_r0
    const r1 = pic_r1
    const verts = convexShape.vertices
    const numVerts = verts.length
    let lastCross = null

    for (let i = 0; i < numVerts + 1; i++) {
        const v0 = verts[i % numVerts],
            v1 = verts[(i + 1) % numVerts]

        vec2.sub(r0, v0, localPoint)
        vec2.sub(r1, v1, localPoint)

        const cross = vec2.crossLength(r0, r1)

        if (lastCross === null) {
            lastCross = cross
        }

        // If we got a different sign of the distance vector, the point is out of the polygon
        if (cross * lastCross < 0) {
            return false
        }
        lastCross = cross
    }
    return true
}

const planeCapsule_tmpCircle = new Circle({ radius: 1 })
const planeCapsule_tmp1 = vec2.create()
const planeCapsule_tmp2 = vec2.create()

// Find the max separation between poly1 and poly2 using edge normals from poly1.
const findMaxSeparation_n = vec2.create()
const findMaxSeparation_v1 = vec2.create()
const findMaxSeparation_tmp = vec2.create()
const findMaxSeparation_tmp2 = vec2.create()
function findMaxSeparation(
    maxSeparationOut: Vec2,
    poly1: Convex,
    position1: Vec2,
    angle1: number,
    poly2: Convex,
    position2: Vec2,
    angle2: number
): number {
    const count1 = poly1.vertices.length
    const count2 = poly2.vertices.length
    const n1s = poly1.normals
    const v1s = poly1.vertices
    const v2s = poly2.vertices

    const n = findMaxSeparation_n
    const v1 = findMaxSeparation_v1
    const tmp = findMaxSeparation_tmp
    const tmp2 = findMaxSeparation_tmp2

    const angle = angle1 - angle2

    let bestIndex = 0
    let maxSeparation = -Number.MAX_VALUE
    for (let i = 0; i < count1; ++i) {
        // Get poly1 normal in frame2.
        vec2.rotate(n, n1s[i], angle)

        // Get poly1 vertex in frame2
        vec2.toGlobalFrame(tmp2, v1s[i], position1, angle1)
        vec2.toLocalFrame(v1, tmp2, position2, angle2)

        // Find deepest point for normal i.
        let si = Number.MAX_VALUE
        for (let j = 0; j < count2; ++j) {
            vec2.sub(tmp, v2s[j], v1)
            const sij = vec2.dot(n, tmp)
            if (sij < si) {
                si = sij
            }
        }

        if (si > maxSeparation) {
            maxSeparation = si
            bestIndex = i
        }
    }

    // Use a vec2 for storing the float value and always return int, for perf
    maxSeparationOut[0] = maxSeparation

    return bestIndex
}

const findIncidentEdge_normal1 = vec2.create()
function findIncidentEdge(
    clipVerticesOut: Vec2[],
    poly1: Convex,
    position1: Vec2,
    angle1: number,
    edge1: number,
    poly2: Convex,
    position2: Vec2,
    angle2: number
): void {
    const normals1 = poly1.normals
    const count2 = poly2.vertices.length
    const vertices2 = poly2.vertices
    const normals2 = poly2.normals

    // Get the normal of the reference edge in poly2's frame.
    const normal1 = findIncidentEdge_normal1
    vec2.rotate(normal1, normals1[edge1], angle1 - angle2)

    // Find the incident edge on poly2.
    let index = 0
    let minDot = Number.MAX_VALUE
    for (let i = 0; i < count2; ++i) {
        const dot = vec2.dot(normal1, normals2[i])
        if (dot < minDot) {
            minDot = dot
            index = i
        }
    }

    // Build the clip vertices for the incident edge.
    const i1 = index
    const i2 = i1 + 1 < count2 ? i1 + 1 : 0

    vec2.toGlobalFrame(clipVerticesOut[0], vertices2[i1], position2, angle2)
    vec2.toGlobalFrame(clipVerticesOut[1], vertices2[i2], position2, angle2)
}

function clipSegmentToLine(vOut: Vec2[], vIn: Vec2[], normal: Vec2, offset: number) {
    // Start with no output points
    let numOut = 0

    // Calculate the distance of end points to the line
    const distance0 = vec2.dot(normal, vIn[0]) - offset
    const distance1 = vec2.dot(normal, vIn[1]) - offset

    // If the points are behind the plane
    if (distance0 <= 0.0) {
        vec2.copy(vOut[numOut++], vIn[0])
    }
    if (distance1 <= 0.0) {
        vec2.copy(vOut[numOut++], vIn[1])
    }

    // If the points are on different sides of the plane
    if (distance0 * distance1 < 0.0) {
        // Find intersection point of edge and plane
        const interp = distance0 / (distance0 - distance1)
        const v = vOut[numOut]
        vec2.sub(v, vIn[1], vIn[0])
        vec2.scale(v, v, interp)
        vec2.add(v, v, vIn[0])
        ++numOut
    }

    return numOut
}

const convexHeightfield_v0 = vec2.create(),
    convexHeightfield_v1 = vec2.create(),
    convexHeightfield_tilePos = vec2.create(),
    convexHeightfield_tempConvexShape = new Convex({
        vertices: [vec2.create(), vec2.create(), vec2.create(), vec2.create()],
    })
