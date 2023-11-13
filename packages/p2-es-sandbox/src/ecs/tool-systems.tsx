import { System, SystemClass } from 'arancini'
import * as p2 from 'p2-es'
import { useEffect } from 'react'
import { drawCircle, drawPath } from '../pixi'
import { canvasTheme } from '../ui'
import { useECS } from './context'
import { Entity } from './entity'

export const Tools = {
    PICK_PAN: 'pickpan',
    POLYGON: 'polygon',
    CIRCLE: 'circle',
    RECTANGLE: 'rectangle',
} as const

export type Tool = (typeof Tools)[keyof typeof Tools]

type CircleToolState = 'default' | 'drawing'

export class CircleToolSystem extends System<Entity> {
    physicsWorld = this.singleton('physicsWorld')!
    pixi = this.singleton('pixi')!
    pointer = this.singleton('pointer')!
    settings = this.singleton('sandboxSettings')!

    toolState: CircleToolState = 'default'
    circleCenter: [number, number] = [0, 0]
    circleRadius: number = 0

    onInit(): void {
        this.pointer.onMove.add(this.onMoveHandler)
        this.pointer.onDown.add(this.onDownHandler)
        this.pointer.onUp.add(this.onUpHandler)
    }

    onDestroy(): void {
        this.onUpHandler()

        this.pointer?.onMove.delete(this.onMoveHandler)
        this.pointer?.onDown.delete(this.onDownHandler)
        this.pointer?.onUp.delete(this.onUpHandler)
    }

    updateGraphics(): void {
        const { drawShape: graphics } = this.pixi.graphics
        graphics.clear()

        if (this.toolState === 'default') return

        drawCircle({
            graphics,
            x: this.circleCenter[0],
            y: this.circleCenter[1],
            angle: 0,
            radius: this.circleRadius,
            lineColor: canvasTheme.body.drawing.lineColor,
            lineWidth: canvasTheme.lineWidth,
        })
    }

    getRadius(center: p2.Vec2, point: p2.Vec2): number {
        return p2.vec2.distance(center, point)
    }

    onUpHandler = (): void => {
        if (this.toolState === 'drawing') {
            if (this.circleRadius > 0) {
                // Create circle
                const body = new p2.Body({
                    mass: 1,
                    position: this.circleCenter,
                })
                const circle = new p2.Circle({
                    radius: this.circleRadius,
                })

                body.wakeUp()
                if (this.settings.newShapeCollisionMask) {
                    circle.collisionMask = this.settings.newShapeCollisionMask
                }
                if (this.settings.newShapeCollisionGroup) {
                    circle.collisionGroup = this.settings.newShapeCollisionGroup
                }

                body.addShape(circle)
                this.physicsWorld.addBody(body)
            }
        }

        this.toolState = 'default'

        this.updateGraphics()
    }

    onDownHandler = (): void => {
        this.toolState = 'drawing'
        this.circleCenter = [...this.pointer.primaryPointer.physicsPosition]
        this.circleRadius = this.getRadius(this.circleCenter, this.pointer.primaryPointer.physicsPosition)

        this.updateGraphics()
    }

    onMoveHandler = (): void => {
        if (this.toolState !== 'drawing') return

        this.circleRadius = this.getRadius(this.circleCenter, this.pointer.primaryPointer.physicsPosition)

        this.updateGraphics()
    }
}

const PICK_PRECISION = 0.1

const SCROLL_FACTOR = 0.1

type InteractionState = 'default' | 'picking' | 'panning' | 'pinching'

export class PickPanToolSystem extends System<Entity> {
    physicsWorld = this.singleton('physicsWorld')!
    pixi = this.singleton('pixi')!
    pointer = this.singleton('pointer')!
    settings = this.singleton('sandboxSettings')!

    interactionState: InteractionState = 'default'

    panningStartPointerPosition: [number, number] = [0, 0]
    panningStartContainerPosition: [number, number] = [0, 0]

    pinchingStartContainerScale: [number, number] = [0, 0]

    pointerBody = new p2.Body({ type: p2.Body.STATIC })

    pointerConstraint: p2.RevoluteConstraint | null = null

    pickLineGraphicsCleared = false

    onInit(): void {
        this.pointer.onWheel.add(this.wheelHandler)

        this.pointer.onPinchStart.add(this.pinchStartHandler)
        this.pointer.onPinchMove.add(this.pinchMoveHandler)
        this.pointer.onPinchEnd.add(this.pinchEndHandler)

        this.pointer.onMove.add(this.onMoveHandler)
        this.pointer.onDown.add(this.onDownHandler)
        this.pointer.onUp.add(this.onUpHandler)
    }

    onUpdate(): void {
        if (!this.pixi) return

        const {
            container,
            graphics: { pick: pickGraphics },
        } = this.pixi

        if (this.pointerConstraint) {
            this.pickLineGraphicsCleared = false

            pickGraphics.clear()
            container.removeChild(pickGraphics)
            container.addChild(pickGraphics)

            pickGraphics.lineStyle(canvasTheme.lineWidth, canvasTheme.body.drawing.lineColor, 1)

            const constraint = this.pointerConstraint

            const worldPivotA = p2.vec2.create()
            constraint.bodyA.toWorldFrame(worldPivotA, constraint.pivotA)

            const worldPivotB = p2.vec2.create()
            constraint.bodyB.toWorldFrame(worldPivotB, constraint.pivotB)

            pickGraphics.moveTo(worldPivotA[0], worldPivotA[1])
            pickGraphics.lineTo(worldPivotB[0], worldPivotB[1])
        } else if (!this.pickLineGraphicsCleared) {
            pickGraphics.clear()
            this.pickLineGraphicsCleared = true
        }
    }

    onDestroy(): void {
        this.onUpHandler()

        this.pointer?.onWheel.delete(this.wheelHandler)

        this.pointer?.onPinchStart.delete(this.pinchStartHandler)
        this.pointer?.onPinchMove.delete(this.pinchMoveHandler)
        this.pointer?.onPinchEnd.delete(this.pinchEndHandler)

        this.pointer?.onMove.delete(this.onMoveHandler)
        this.pointer?.onDown.delete(this.onDownHandler)
        this.pointer?.onUp.delete(this.onUpHandler)
    }

    onUpHandler = (): void => {
        if (this.interactionState === 'picking') {
            if (this.pointerConstraint) {
                this.physicsWorld.removeConstraint(this.pointerConstraint)
                this.pointerConstraint = null
            }

            this.physicsWorld.removeBody(this.pointerBody)
        }

        this.interactionState = 'default'
    }

    onDownHandler = (): void => {
        if (this.interactionState === 'pinching') {
            return
        }

        if (this.interactionState === 'panning' || this.interactionState === 'picking') {
            this.onUpHandler()
        }

        const [x, y] = this.pointer.primaryPointer.physicsPosition
        const pointerPhysicsPosition: [number, number] = [x, y]

        const hitTest = this.physicsWorld.hitTest(pointerPhysicsPosition, this.physicsWorld.bodies, PICK_PRECISION)

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
            this.interactionState = 'picking'

            // move the pointer body
            this.pointerBody.position[0] = x
            this.pointerBody.position[1] = y

            // add pointer body to world
            this.physicsWorld.addBody(this.pointerBody)

            // Get local point of the body to create the joint on
            const localPoint = p2.vec2.create()
            body.toLocalFrame(localPoint, pointerPhysicsPosition)

            // Add pointer joint
            this.pointerConstraint = new p2.RevoluteConstraint(this.pointerBody, body, {
                localPivotA: [0, 0],
                localPivotB: localPoint,
                maxForce: 1000 * body.mass,
            })
            this.physicsWorld.addConstraint(this.pointerConstraint)
        } else if (this.settings.enablePanning) {
            this.interactionState = 'panning'

            const [stageX, stageY] = this.pointer.primaryPointer.stagePosition
            const { x: containerX, y: containerY } = this.pixi.container.position

            this.panningStartPointerPosition[0] = stageX
            this.panningStartPointerPosition[1] = stageY

            this.panningStartContainerPosition[0] = containerX
            this.panningStartContainerPosition[1] = containerY
        }
    }

    onMoveHandler = (): void => {
        if (this.interactionState === 'panning') {
            const [stageX, stageY] = this.pointer.primaryPointer.stagePosition
            const [panningStartPointerX, panningStartPointerY] = this.panningStartPointerPosition
            const [panningStartContainerX, panningStartContainerY] = this.panningStartContainerPosition

            this.pixi.container.position.x = stageX - panningStartPointerX + panningStartContainerX
            this.pixi.container.position.y = stageY - panningStartPointerY + panningStartContainerY

            return
        }

        if (this.interactionState === 'picking') {
            const [x, y] = this.pointer.primaryPointer.physicsPosition
            this.pointerBody.position[0] = x
            this.pointerBody.position[1] = y
        }
    }

    zoomByMultiplier(x: number, y: number, zoomOut: boolean, multiplier: number) {
        let scrollFactor = SCROLL_FACTOR

        if (!zoomOut) {
            scrollFactor *= -1
        }

        scrollFactor *= Math.abs(multiplier!)

        this.pixi.container.scale.x *= 1 + scrollFactor
        this.pixi.container.scale.y *= 1 + scrollFactor
        this.pixi.container.position.x += scrollFactor * (this.pixi.container.position.x - x)
        this.pixi.container.position.y += scrollFactor * (this.pixi.container.position.y - y)
    }

    wheelHandler = (delta: number) => {
        if (!this.settings.enableZooming) return

        const out = delta >= 0
        this.zoomByMultiplier(
            this.pointer.primaryPointer.stagePosition[0],
            this.pointer.primaryPointer.stagePosition[1],
            out,
            delta
        )
    }

    pinchStartHandler = () => {
        if (this.interactionState === 'picking') {
            this.onUpHandler()
        }

        if (!this.settings.enableZooming) return

        this.interactionState = 'pinching'

        this.pinchingStartContainerScale = [this.pixi.container.scale.x, this.pixi.container.scale.y]
    }

    pinchEndHandler = () => {
        this.interactionState = 'default'
    }

    zoomByScalar(x: number, y: number, scalar: number) {
        this.pixi.container.scale.x *= scalar
        this.pixi.container.scale.y *= scalar
        this.pixi.container.position.x += (scalar - 1) * (this.pixi.container.position.x - x)
        this.pixi.container.position.y += (scalar - 1) * (this.pixi.container.position.y - y)
    }

    pinchMoveHandler = () => {
        this.interactionState = 'pinching'

        const touchA = this.pointer.touches[this.pointer.pinchATouch!]
        const touchB = this.pointer.touches[this.pointer.pinchBTouch!]

        const zoomScalar = this.pointer.pinchLength! / this.pointer.pinchInitialLength!
        const x = (touchA.stagePosition[0] + touchB.stagePosition[0]) * 0.5
        const y = (touchA.stagePosition[1] + touchB.stagePosition[1]) * 0.5

        this.zoomByScalar(x, y, zoomScalar)
    }
}

type PolygonToolState = 'default' | 'drawing'

export class PolygonToolSystem extends System<Entity> {
    physicsWorld = this.singleton('physicsWorld')!
    pixi = this.singleton('pixi')!
    pointer = this.singleton('pointer')!
    settings = this.singleton('sandboxSettings')!

    toolState: PolygonToolState = 'default'
    polygonPoints: [number, number][] = []

    updateGraphics() {
        const { drawShape: graphics } = this.pixi.graphics
        graphics.clear()

        if (this.toolState === 'default') return

        drawPath({
            graphics,
            path: this.polygonPoints.map((point) => [...point]),
            lineColor: canvasTheme.body.drawing.lineColor,
            lineWidth: canvasTheme.lineWidth,
        })
    }

    onUpHandler = () => {
        if (this.toolState === 'drawing') {
            if (this.polygonPoints.length > 3) {
                const body = new p2.Body({ mass: 1 })
                if (
                    body.fromPolygon(this.polygonPoints, {
                        removeCollinearPoints: 0.1,
                    })
                ) {
                    body.wakeUp()
                    for (let i = 0; i < body.shapes.length; i++) {
                        const s = body.shapes[i]
                        if (this.settings.newShapeCollisionMask) {
                            s.collisionMask = this.settings.newShapeCollisionMask
                        }
                        if (this.settings.newShapeCollisionGroup) {
                            s.collisionGroup = this.settings.newShapeCollisionGroup
                        }
                    }

                    this.physicsWorld.addBody(body)
                }
            }

            this.polygonPoints = []
            this.toolState = 'default'

            this.updateGraphics()
        }
    }

    onDownHandler = () => {
        this.toolState = 'drawing'
        this.polygonPoints = [[...this.pointer.primaryPointer.physicsPosition]]

        this.updateGraphics()
    }

    onMoveHandler = () => {
        if (this.toolState !== 'drawing') return

        const sqdist = p2.vec2.distance(
            this.pointer.primaryPointer.physicsPosition,
            this.polygonPoints[this.polygonPoints.length - 1]
        )

        const sampling = 0.4
        if (sqdist > sampling * sampling) {
            this.polygonPoints.push([...this.pointer.primaryPointer.physicsPosition])

            this.updateGraphics()
        }
    }

    onInit(): void {
        this.pointer.onMove.add(this.onMoveHandler)
        this.pointer.onDown.add(this.onDownHandler)
        this.pointer.onUp.add(this.onUpHandler)
    }

    onDestroy(): void {
        this.onUpHandler()

        this.pointer?.onMove.delete(this.onMoveHandler)
        this.pointer?.onDown.delete(this.onDownHandler)
        this.pointer?.onUp.delete(this.onUpHandler)
    }
}

type RectangleToolState = 'default' | 'drawing'

export class RectangleToolSystem extends System<Entity> {
    physicsWorld = this.singleton('physicsWorld')!
    pixi = this.singleton('pixi')!
    pointer = this.singleton('pointer')!
    settings = this.singleton('sandboxSettings')!

    toolState: RectangleToolState = 'default'
    rectangleStart: [number, number] = [0, 0]
    rectangleEnd: [number, number] = [0, 0]

    onInit() {
        this.pointer.onMove.add(this.onMoveHandler)
        this.pointer.onDown.add(this.onDownHandler)
        this.pointer.onUp.add(this.onUpHandler)
    }

    onDestroy(): void {
        this.onUpHandler()

        this.pointer?.onMove.delete(this.onMoveHandler)
        this.pointer?.onDown.delete(this.onDownHandler)
        this.pointer?.onUp.delete(this.onUpHandler)
    }

    updateGraphics() {
        const { drawShape: graphics } = this.pixi.graphics
        graphics.clear()

        if (this.toolState === 'default') return

        let [startX, startY] = this.rectangleStart
        let [endX, endY] = this.rectangleEnd

        if (startX > endX) {
            const tmp = endX
            endX = startX
            startX = tmp
        }

        if (startY > endY) {
            const tmp = endY
            endY = startY
            startY = tmp
        }

        const width = endX - startX
        const height = endY - startY

        console.log('drawPath')
        if (width > 0 && height > 0) {
            drawPath({
                graphics,
                path: [
                    [startX, startY],
                    [startX + width, startY],
                    [startX + width, startY + height],
                    [startX, startY + height],
                ],
                lineColor: canvasTheme.body.drawing.lineColor,
                lineWidth: canvasTheme.lineWidth,
            })
        }
    }

    onUpHandler = () => {
        if (this.toolState === 'drawing') {
            // Make sure first point is upper left
            const start = this.rectangleStart
            const end = this.rectangleEnd
            for (let i = 0; i < 2; i++) {
                if (start[i] > end[i]) {
                    const tmp = end[i]
                    end[i] = start[i]
                    start[i] = tmp
                }
            }
            const width = Math.abs(start[0] - end[0])
            const height = Math.abs(start[1] - end[1])

            if (width > 0 && height > 0) {
                // Create box
                const body = new p2.Body({
                    mass: 1,
                    position: [start[0] + width * 0.5, start[1] + height * 0.5],
                })
                const rectangleShape = new p2.Box({ width, height })

                body.wakeUp()
                if (this.settings.newShapeCollisionMask) {
                    rectangleShape.collisionMask = this.settings.newShapeCollisionMask
                }
                if (this.settings.newShapeCollisionGroup) {
                    rectangleShape.collisionGroup = this.settings.newShapeCollisionGroup
                }

                body.addShape(rectangleShape)
                this.physicsWorld.addBody(body)
            }

            this.rectangleStart = [0, 0]
            this.rectangleEnd = [0, 0]

            this.toolState = 'default'

            this.updateGraphics()
        }
    }

    onDownHandler = () => {
        this.toolState = 'drawing'
        this.rectangleStart = [...this.pointer.primaryPointer.physicsPosition]
        this.rectangleEnd = [...this.pointer.primaryPointer.physicsPosition]

        this.updateGraphics()
    }

    onMoveHandler = () => {
        if (this.toolState !== 'drawing') return

        this.rectangleEnd = [...this.pointer.primaryPointer.physicsPosition]

        this.updateGraphics()
    }
}

const ToolSystemComponent = (system: SystemClass) => () => {
    const ecs = useECS()

    useEffect(() => {
        ecs.world.registerSystem(system)

        return () => {
            ecs.world.unregisterSystem(system)
        }
    }, [])

    return null
}

export const CircleTool = ToolSystemComponent(CircleToolSystem)
export const PickPanTool = ToolSystemComponent(PickPanToolSystem)
export const PolygonTool = ToolSystemComponent(PolygonToolSystem)
export const RectangleTool = ToolSystemComponent(RectangleToolSystem)
