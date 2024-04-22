import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { drawPath } from '../pixi'
import { usePhysicsWorldStore, usePixiStore, usePointerStore, useSandboxSettings } from '../state'
import { canvasTheme } from '../ui'

type PolygonToolState = 'default' | 'drawing'

export const PolygonTool = () => {
    const { world: physics } = usePhysicsWorldStore()

    const pixi = usePixiStore()
    const pointer = usePointerStore()
    const settings = useSandboxSettings()

    const toolState = useRef<PolygonToolState>('default')

    const polygonPoints = useRef<[number, number][]>([])

    const updateGraphics = () => {
        const { drawShape: graphics } = pixi.graphics
        graphics.clear()

        if (toolState.current === 'default') return

        drawPath({
            graphics,
            path: polygonPoints.current.map((point) => [...point]),
            lineColor: canvasTheme.body.drawing.lineColor,
            lineWidth: canvasTheme.lineWidth,
        })
    }

    const onUpHandler = () => {
        if (!physics) return

        if (toolState.current === 'drawing') {
            if (polygonPoints.current.length > 3) {
                const body = new p2.Body({ mass: 1 })
                if (
                    body.fromPolygon(polygonPoints.current, {
                        removeCollinearPoints: 0.1,
                    })
                ) {
                    body.wakeUp()
                    for (let i = 0; i < body.shapes.length; i++) {
                        const s = body.shapes[i]
                        if (settings.newShapeCollisionMask) {
                            s.collisionMask = settings.newShapeCollisionMask
                        }
                        if (settings.newShapeCollisionGroup) {
                            s.collisionGroup = settings.newShapeCollisionGroup
                        }
                    }

                    physics.addBody(body)
                }
            }

            polygonPoints.current = []
            toolState.current = 'default'

            updateGraphics()
        }
    }

    const onDownHandler = () => {
        toolState.current = 'drawing'
        polygonPoints.current = [[...pointer.primaryPointer.physicsPosition]]

        updateGraphics()
    }

    const onMoveHandler = () => {
        if (toolState.current !== 'drawing') return

        const sqdist = p2.vec2.distance(
            pointer.primaryPointer.physicsPosition,
            polygonPoints.current[polygonPoints.current.length - 1]
        )

        const sampling = 0.4
        if (sqdist > sampling * sampling) {
            polygonPoints.current.push([...pointer.primaryPointer.physicsPosition])

            updateGraphics()
        }
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
