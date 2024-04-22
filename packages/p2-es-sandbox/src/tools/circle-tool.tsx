import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { drawCircle } from '../pixi'
import { usePhysicsWorldStore, usePixiStore, usePointerStore, useSandboxSettings } from '../state'
import { canvasTheme } from '../ui'

type CircleToolState = 'default' | 'drawing'

export const CircleTool = () => {
    const { world: physics } = usePhysicsWorldStore()

    const pixi = usePixiStore()
    const pointer = usePointerStore()
    const settings = useSandboxSettings()

    const toolState = useRef<CircleToolState>('default')
    const circleCenter = useRef<[number, number]>([0, 0])
    const circleRadius = useRef<number>(0)

    const updateGraphics = (): void => {
        const { drawShape: graphics } = pixi.graphics
        graphics.clear()

        if (toolState.current === 'default') return

        drawCircle({
            graphics,
            x: circleCenter.current[0],
            y: circleCenter.current[1],
            angle: 0,
            radius: circleRadius.current,
            lineColor: canvasTheme.body.drawing.lineColor,
            lineWidth: canvasTheme.lineWidth,
        })
    }

    const getRadius = (center: p2.Vec2, point: p2.Vec2): number => {
        return p2.vec2.distance(center, point)
    }

    const onUpHandler = (): void => {
        if (!physics) return

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

                if (settings.newShapeCollisionMask) {
                    circle.collisionMask = settings.newShapeCollisionMask
                }
                if (settings.newShapeCollisionGroup) {
                    circle.collisionGroup = settings.newShapeCollisionGroup
                }

                body.addShape(circle)

                physics.addBody(body)
            }
        }

        toolState.current = 'default'

        updateGraphics()
    }

    const onDownHandler = (): void => {
        toolState.current = 'drawing'
        circleCenter.current = [...pointer.primaryPointer.physicsPosition]
        circleRadius.current = getRadius(circleCenter.current, pointer.primaryPointer.physicsPosition)

        updateGraphics()
    }

    const onMoveHandler = (): void => {
        if (toolState.current !== 'drawing') return

        circleRadius.current = getRadius(circleCenter.current, pointer.primaryPointer.physicsPosition)

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
    }, [onUpHandler, onDownHandler, onMoveHandler])

    return null
}
