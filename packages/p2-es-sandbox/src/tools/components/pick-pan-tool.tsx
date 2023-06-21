import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import {
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    STAGES,
    useFrame,
    useSingletonComponent,
} from '../../ecs'
import { useConst } from '../../hooks'
import { canvasTheme } from '../../ui'

const PICK_PRECISION = 0.1

const SCROLL_FACTOR = 0.1

type InteractionState = 'default' | 'picking' | 'panning' | 'pinching'

export const PickPanTool = () => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const pointer = useSingletonComponent(PointerComponent)

    const interactionState = useRef<InteractionState>('default')

    const panningStartPointerPosition = useRef([0, 0])
    const panningStartContainerPosition = useRef([0, 0])

    const pinchingStartContainerScale = useRef([0, 0])

    const pointerBody = useConst<p2.Body>(
        () => new p2.Body({ type: p2.Body.STATIC })
    )

    const pointerConstraint = useRef<p2.RevoluteConstraint | null>(null)

    useEffect(() => {
        if (!pixi || !physicsWorld || !pointer) return

        const { container } = pixi
        const { world } = physicsWorld

        const onUpHandler = () => {
            if (interactionState.current === 'picking') {
                if (pointerConstraint.current) {
                    world.removeConstraint(pointerConstraint.current)
                    pointerConstraint.current = null
                }

                world.removeBody(pointerBody)
            }

            interactionState.current = 'default'
        }

        const onDownHandler = () => {
            if (interactionState.current === 'pinching') {
                return
            }

            if (
                interactionState.current === 'panning' ||
                interactionState.current === 'picking'
            ) {
                onUpHandler()
            }

            const [x, y] = pointer.primaryPointer.physicsPosition
            const pointerPhysicsPosition: [number, number] = [x, y]

            const hitTest = world.hitTest(
                pointerPhysicsPosition,
                world.bodies,
                PICK_PRECISION
            )

            // Remove static bodies
            let body: p2.Body | undefined
            while (hitTest.length > 0) {
                body = hitTest.shift()
                if (body && body.type === p2.Body.STATIC) {
                    body = undefined
                } else {
                    break
                }
            }

            if (body) {
                body.wakeUp()

                interactionState.current = 'picking'

                // move the pointer body
                pointerBody.position[0] = x
                pointerBody.position[1] = y

                // add pointer body to world
                world.addBody(pointerBody)

                // Get local point of the body to create the joint on
                const localPoint = p2.vec2.create()
                body.toLocalFrame(localPoint, pointerPhysicsPosition)

                // Add pointer joint
                pointerConstraint.current = new p2.RevoluteConstraint(
                    pointerBody,
                    body,
                    {
                        localPivotA: [0, 0],
                        localPivotB: localPoint,
                        maxForce: 1000 * body.mass,
                    }
                )
                world.addConstraint(pointerConstraint.current)
            } else {
                interactionState.current = 'panning'

                const [stageX, stageY] = pointer.primaryPointer.stagePosition
                const { x: containerX, y: containerY } = container.position

                panningStartPointerPosition.current[0] = stageX
                panningStartPointerPosition.current[1] = stageY

                panningStartContainerPosition.current[0] = containerX
                panningStartContainerPosition.current[1] = containerY
            }
        }

        const onMoveHandler = () => {
            if (interactionState.current === 'panning') {
                const [stageX, stageY] = pointer.primaryPointer.stagePosition
                const [panningStartPointerX, panningStartPointerY] =
                    panningStartPointerPosition.current
                const [panningStartContainerX, panningStartContainerY] =
                    panningStartContainerPosition.current

                container.position.x =
                    stageX - panningStartPointerX + panningStartContainerX
                container.position.y =
                    stageY - panningStartPointerY + panningStartContainerY

                return
            }

            if (interactionState.current === 'picking') {
                const [x, y] = pointer.primaryPointer.physicsPosition
                pointerBody.position[0] = x
                pointerBody.position[1] = y
            }
        }

        const zoomByMultiplier = (
            x: number,
            y: number,
            zoomOut: boolean,
            multiplier: number
        ) => {
            let scrollFactor = SCROLL_FACTOR

            if (!zoomOut) {
                scrollFactor *= -1
            }

            scrollFactor *= Math.abs(multiplier!)

            container.scale.x *= 1 + scrollFactor
            container.scale.y *= 1 + scrollFactor
            container.position.x += scrollFactor * (container.position.x - x)
            container.position.y += scrollFactor * (container.position.y - y)
        }

        const wheelHandler = (delta: number) => {
            const out = delta >= 0
            zoomByMultiplier(
                pointer.primaryPointer.stagePosition[0],
                pointer.primaryPointer.stagePosition[1],
                out,
                delta
            )
        }

        const pinchStartHandler = () => {
            if (interactionState.current === 'picking') {
                onUpHandler()
            }

            interactionState.current = 'pinching'

            pinchingStartContainerScale.current = [
                container.scale.x,
                container.scale.y,
            ]
        }

        const pinchEndHandler = () => {
            interactionState.current = 'default'
        }

        const zoomByScalar = (x: number, y: number, scalar: number) => {
            container.scale.x *= scalar
            container.scale.y *= scalar
            container.position.x += (scalar - 1) * (container.position.x - x)
            container.position.y += (scalar - 1) * (container.position.y - y)
        }

        const pinchMoveHandler = () => {
            interactionState.current = 'pinching'

            const touchA = pointer.touches[pointer.pinchATouch!]
            const touchB = pointer.touches[pointer.pinchBTouch!]

            const zoomScalar =
                pointer.pinchLength! / pointer.pinchInitialLength!
            const x = (touchA.stagePosition[0] + touchB.stagePosition[0]) * 0.5
            const y = (touchA.stagePosition[1] + touchB.stagePosition[1]) * 0.5

            zoomByScalar(x, y, zoomScalar)
        }

        pointer.onWheel.add(wheelHandler)

        pointer.onPinchStart.add(pinchStartHandler)
        pointer.onPinchMove.add(pinchMoveHandler)
        pointer.onPinchEnd.add(pinchEndHandler)

        pointer.onMove.add(onMoveHandler)
        pointer.onDown.add(onDownHandler)
        pointer.onUp.add(onUpHandler)

        return () => {
            onUpHandler()

            pointer.onWheel.delete(wheelHandler)

            pointer.onPinchStart.delete(pinchStartHandler)
            pointer.onPinchMove.delete(pinchMoveHandler)
            pointer.onPinchEnd.delete(pinchEndHandler)

            pointer.onMove.delete(onMoveHandler)
            pointer.onDown.delete(onDownHandler)
            pointer.onUp.delete(onUpHandler)
        }
    }, [pixi?.id, physicsWorld?.id, pointer?.id])

    // draw pick line
    const pickLineGraphicsCleared = useRef(false)
    useFrame(() => {
        if (!pixi) return

        const {
            container,
            graphics: { pick: pickGraphics },
        } = pixi

        if (pointerConstraint.current) {
            pickLineGraphicsCleared.current = false

            pickGraphics.clear()
            container.removeChild(pickGraphics)
            container.addChild(pickGraphics)

            pickGraphics.lineStyle(
                canvasTheme.lineWidth,
                canvasTheme.bodies.drawing.lineColor,
                1
            )

            const constraint = pointerConstraint.current

            const worldPivotA = p2.vec2.create()
            constraint.bodyA.toWorldFrame(worldPivotA, constraint.pivotA)

            const worldPivotB = p2.vec2.create()
            constraint.bodyB.toWorldFrame(worldPivotB, constraint.pivotB)

            pickGraphics.moveTo(worldPivotA[0], worldPivotA[1])
            pickGraphics.lineTo(worldPivotB[0], worldPivotB[1])
        } else if (!pickLineGraphicsCleared.current) {
            pickGraphics.clear()
            pickLineGraphicsCleared.current = true
        }
    }, STAGES.RENDER_TOOL)

    return null
}
