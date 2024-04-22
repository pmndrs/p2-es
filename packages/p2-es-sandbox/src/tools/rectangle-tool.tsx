import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { drawPath } from '../pixi'
import { usePhysicsWorldStore, usePixiStore, usePointerStore, useSandboxSettings } from '../state'
import { canvasTheme } from '../ui'

type RectangleToolState = 'default' | 'drawing'

export const RectangleTool = () => {
    const { world: physics } = usePhysicsWorldStore()

    const pixi = usePixiStore()
    const pointer = usePointerStore()
    const settings = useSandboxSettings()

    const toolState = useRef<RectangleToolState>('default')
    const rectangleStart = useRef<[number, number]>([0, 0])
    const rectangleEnd = useRef<[number, number]>([0, 0])

    const updateGraphics = () => {
        const { drawShape: graphics } = pixi.graphics
        graphics.clear()

        if (toolState.current === 'default') return

        let [startX, startY] = rectangleStart.current
        let [endX, endY] = rectangleEnd.current

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

    const onUpHandler = () => {
        if (!physics) return

        if (toolState.current === 'drawing') {
            // Make sure first point is upper left
            const start = rectangleStart.current
            const end = rectangleEnd.current
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
                if (settings.newShapeCollisionMask) {
                    rectangleShape.collisionMask = settings.newShapeCollisionMask
                }
                if (settings.newShapeCollisionGroup) {
                    rectangleShape.collisionGroup = settings.newShapeCollisionGroup
                }

                body.addShape(rectangleShape)
                physics.addBody(body)
            }

            rectangleStart.current = [0, 0]
            rectangleEnd.current = [0, 0]

            toolState.current = 'default'

            updateGraphics()
        }
    }

    const onDownHandler = () => {
        toolState.current = 'drawing'
        rectangleStart.current = [...pointer.primaryPointer.physicsPosition]
        rectangleEnd.current = [...pointer.primaryPointer.physicsPosition]

        updateGraphics()
    }

    const onMoveHandler = () => {
        if (toolState.current !== 'drawing') return

        rectangleEnd.current = [...pointer.primaryPointer.physicsPosition]

        updateGraphics()
    }

    useEffect(() => {
        pointer.onMove.add(onMoveHandler)
        pointer.onDown.add(onDownHandler)
        pointer.onUp.add(onUpHandler)

        return () => {
            onUpHandler()

            pointer.onMove.delete(onMoveHandler)
            pointer.onDown.delete(onDownHandler)
            pointer.onUp.delete(onUpHandler)
        }
    }, [onMoveHandler, onDownHandler, onUpHandler])

    return null
}
