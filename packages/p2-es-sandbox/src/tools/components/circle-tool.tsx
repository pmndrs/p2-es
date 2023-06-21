import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import {
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    useSingletonComponent,
} from '../../ecs'
import { drawCircle } from '../../pixi'
import { canvasTheme } from '../../ui'

type CircleToolState = 'default' | 'drawing'

export type CircleToolProps = {
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
}

export const CircleTool = ({
    newShapeCollisionGroup,
    newShapeCollisionMask,
}: CircleToolProps) => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const pointer = useSingletonComponent(PointerComponent)

    const toolState = useRef<CircleToolState>('default')
    const circleCenter = useRef<[number, number]>([0, 0])
    const circleRadius = useRef<number>(0)

    useEffect(() => {
        if (!pixi || !physicsWorld || !pointer) return

        const { world } = physicsWorld

        const updateGraphics = () => {
            const { drawShape: graphics } = pixi.graphics
            graphics.clear()

            if (toolState.current === 'default') return

            drawCircle({
                graphics,
                x: circleCenter.current[0],
                y: circleCenter.current[1],
                angle: 0,
                radius: circleRadius.current,
                lineColor: canvasTheme.bodies.drawing.lineColor,
                lineWidth: canvasTheme.lineWidth,
            })
        }

        const onUpHandler = () => {
            if (toolState.current === 'drawing') {
                if (circleRadius.current > 0) {
                    // Create circle
                    const body = new p2.Body({
                        mass: 1,
                        position: circleCenter.current,
                    })
                    const circle = new p2.Circle({
                        radius: circleRadius.current,
                    })

                    body.wakeUp()
                    if (newShapeCollisionMask) {
                        circle.collisionMask = newShapeCollisionMask
                    }
                    if (newShapeCollisionGroup) {
                        circle.collisionGroup = newShapeCollisionGroup
                    }

                    body.addShape(circle)
                    world.addBody(body)
                }
            }

            toolState.current = 'default'
            updateGraphics()
        }

        const getRadius = (center: p2.Vec2, point: p2.Vec2) => {
            return p2.vec2.distance(center, point)
        }

        const onDownHandler = () => {
            toolState.current = 'drawing'
            circleCenter.current = [...pointer.primaryPointer.physicsPosition]
            circleRadius.current = getRadius(
                circleCenter.current,
                pointer.primaryPointer.physicsPosition
            )
            updateGraphics()
        }

        const onMoveHandler = () => {
            if (toolState.current !== 'drawing') return

            circleRadius.current = getRadius(
                circleCenter.current,
                pointer.primaryPointer.physicsPosition
            )
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
