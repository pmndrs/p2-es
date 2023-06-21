import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import {
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    useSingletonComponent,
} from '../../ecs'
import { drawRectangle } from '../../pixi'
import { canvasTheme } from '../../ui'

type RectangleToolState = 'default' | 'drawing'

export type RectangleToolProps = {
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
}

export const RectangleTool = ({
    newShapeCollisionGroup,
    newShapeCollisionMask,
}: RectangleToolProps) => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const pointer = useSingletonComponent(PointerComponent)

    const toolState = useRef<RectangleToolState>('default')
    const rectangleStart = useRef<[number, number]>([0, 0])
    const rectangleEnd = useRef<[number, number]>([0, 0])

    useEffect(() => {
        if (!pixi || !physicsWorld || !pointer) return

        const { world } = physicsWorld

        const updateGraphics = () => {
            const { drawShape: graphics } = pixi.graphics
            graphics.clear()

            if (toolState.current === 'default') return

            const start = rectangleStart.current
            const end = rectangleEnd.current

            const width = start[0] - end[0]
            const height = start[1] - end[1]

            drawRectangle({
                graphics,
                x: start[0] - width / 2,
                y: start[1] - height / 2,
                w: width,
                h: height,
                angle: 0,
                lineColor: canvasTheme.bodies.drawing.lineColor,
                lineWidth: canvasTheme.lineWidth,
            })
        }

        const onUpHandler = () => {
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
                        position: [
                            start[0] + width * 0.5,
                            start[1] + height * 0.5,
                        ],
                    })
                    const rectangleShape = new p2.Box({ width, height })

                    body.wakeUp()
                    if (newShapeCollisionMask) {
                        rectangleShape.collisionMask = newShapeCollisionMask
                    }
                    if (newShapeCollisionGroup) {
                        rectangleShape.collisionGroup = newShapeCollisionGroup
                    }

                    body.addShape(rectangleShape)
                    world.addBody(body)
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

        pointer.onMove.add(onMoveHandler)
        pointer.onDown.add(onDownHandler)
        pointer.onUp.add(onUpHandler)

        return () => {
            onUpHandler()

            pointer.onMove.delete(onMoveHandler)
            pointer.onDown.delete(onDownHandler)
            pointer.onUp.delete(onUpHandler)
        }
    }, [pixi?.id, physicsWorld?.id, pointer?.id])

    return null
}
