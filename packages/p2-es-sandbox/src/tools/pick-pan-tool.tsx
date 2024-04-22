import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { useConst } from '../hooks/use-const'
import { useFrame } from '../hooks/use-frame'
import { usePhysicsWorldStore, usePixiStore, usePointerStore, useSandboxSettings } from '../state'
import { canvasTheme } from '../ui'

const PICK_PRECISION = 0.1

const SCROLL_FACTOR = 0.1

export const PickPanTool = () => {
    const { world: physics } = usePhysicsWorldStore()

    const pixi = usePixiStore()
    const pointer = usePointerStore()
    const settings = useSandboxSettings()

    const interactionState = useRef<'default' | 'picking' | 'panning' | 'pinching'>('default')

    const panningStartPointerPosition = useRef<[number, number]>([0, 0])
    const panningStartContainerPosition = useRef<[number, number]>([0, 0])

    const pinchingStartContainerScale = useRef<[number, number]>([0, 0])

    const pointerBody = useConst(() => new p2.Body({ type: p2.Body.STATIC }))

    const pointerConstraint = useRef<p2.RevoluteConstraint | null>(null)

    const pickLineGraphicsCleared = useRef(false)

    useFrame(() => {
        const {
            container,
            graphics: { pick: pickGraphics },
        } = pixi

        if (pointerConstraint.current) {
            pickLineGraphicsCleared.current = false

            pickGraphics.clear()
            container.removeChild(pickGraphics)
            container.addChild(pickGraphics)

            pickGraphics.lineStyle(canvasTheme.lineWidth, canvasTheme.body.drawing.lineColor, 1)

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
    })

    const onUpHandler = (): void => {
        if (!physics) return

        if (interactionState.current === 'picking') {
            if (pointerConstraint.current) {
                physics.removeConstraint(pointerConstraint.current)
                pointerConstraint.current = null
            }

            physics.removeBody(pointerBody)
        }

        interactionState.current = 'default'
    }

    const onDownHandler = (): void => {
        if (!physics) return

        if (interactionState.current === 'pinching') {
            return
        }

        if (interactionState.current === 'panning' || interactionState.current === 'picking') {
            onUpHandler()
        }

        const [x, y] = pointer.primaryPointer.physicsPosition
        const pointerPhysicsPosition: [number, number] = [x, y]

        const hitTest = physics.hitTest(pointerPhysicsPosition, physics.bodies, PICK_PRECISION)

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
            physics.addBody(pointerBody)

            // Get local point of the body to create the joint on
            const localPoint = p2.vec2.create()
            body.toLocalFrame(localPoint, pointerPhysicsPosition)

            // Add pointer joint
            pointerConstraint.current = new p2.RevoluteConstraint(pointerBody, body, {
                localPivotA: [0, 0],
                localPivotB: localPoint,
                maxForce: 1000 * body.mass,
            })
            physics.addConstraint(pointerConstraint.current)
        } else if (settings.enablePanning) {
            interactionState.current = 'panning'

            const [stageX, stageY] = pointer.primaryPointer.stagePosition
            const { x: containerX, y: containerY } = pixi.container.position

            panningStartPointerPosition.current[0] = stageX
            panningStartPointerPosition.current[1] = stageY

            panningStartContainerPosition.current[0] = containerX
            panningStartContainerPosition.current[1] = containerY
        }
    }

    const onMoveHandler = (): void => {
        if (interactionState.current === 'panning') {
            const [stageX, stageY] = pointer.primaryPointer.stagePosition
            const [panningStartPointerX, panningStartPointerY] = panningStartPointerPosition.current
            const [panningStartContainerX, panningStartContainerY] = panningStartContainerPosition.current

            pixi.container.position.x = stageX - panningStartPointerX + panningStartContainerX
            pixi.container.position.y = stageY - panningStartPointerY + panningStartContainerY

            return
        }

        if (interactionState.current === 'picking') {
            const [x, y] = pointer.primaryPointer.physicsPosition
            pointerBody.position[0] = x
            pointerBody.position[1] = y
        }
    }

    const zoomByMultiplier = (x: number, y: number, zoomOut: boolean, multiplier: number) => {
        let scrollFactor = SCROLL_FACTOR

        if (!zoomOut) {
            scrollFactor *= -1
        }

        scrollFactor *= Math.abs(multiplier!)

        pixi.container.scale.x *= 1 + scrollFactor
        pixi.container.scale.y *= 1 + scrollFactor
        pixi.container.position.x += scrollFactor * (pixi.container.position.x - x)
        pixi.container.position.y += scrollFactor * (pixi.container.position.y - y)
    }

    const wheelHandler = (delta: number) => {
        if (!settings.enableZooming) return

        const out = delta >= 0
        zoomByMultiplier(pointer.primaryPointer.stagePosition[0], pointer.primaryPointer.stagePosition[1], out, delta)
    }

    const pinchStartHandler = () => {
        if (interactionState.current === 'picking') {
            onUpHandler()
        }

        if (!settings.enableZooming) return

        interactionState.current = 'pinching'

        pinchingStartContainerScale.current = [pixi.container.scale.x, pixi.container.scale.y]
    }

    const pinchEndHandler = () => {
        interactionState.current = 'default'
    }

    const zoomByScalar = (x: number, y: number, scalar: number) => {
        pixi.container.scale.x *= scalar
        pixi.container.scale.y *= scalar
        pixi.container.position.x += (scalar - 1) * (pixi.container.position.x - x)
        pixi.container.position.y += (scalar - 1) * (pixi.container.position.y - y)
    }

    const pinchMoveHandler = () => {
        interactionState.current = 'pinching'

        const touchA = pointer.touches[pointer.pinchATouch!]
        const touchB = pointer.touches[pointer.pinchBTouch!]

        const zoomScalar = pointer.pinchLength! / pointer.pinchInitialLength!
        const x = (touchA.stagePosition[0] + touchB.stagePosition[0]) * 0.5
        const y = (touchA.stagePosition[1] + touchB.stagePosition[1]) * 0.5

        zoomByScalar(x, y, zoomScalar)
    }

    useEffect(() => {
        pointer.onUp.add(onUpHandler)
        pointer.onDown.add(onDownHandler)
        pointer.onMove.add(onMoveHandler)
        pointer.onWheel.add(wheelHandler)
        pointer.onPinchStart.add(pinchStartHandler)
        pointer.onPinchMove.add(pinchMoveHandler)
        pointer.onPinchEnd.add(pinchEndHandler)

        return () => {
            onUpHandler()

            pointer.onUp.delete(onUpHandler)
            pointer.onDown.delete(onDownHandler)
            pointer.onMove.delete(onMoveHandler)
            pointer.onWheel.delete(wheelHandler)
            pointer.onPinchStart.delete(pinchStartHandler)
            pointer.onPinchMove.delete(pinchMoveHandler)
            pointer.onPinchEnd.delete(pinchEndHandler)
        }
    }, [onUpHandler, onDownHandler, onMoveHandler, wheelHandler, pinchStartHandler, pinchMoveHandler, pinchEndHandler])

    return null
}
