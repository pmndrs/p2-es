import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import {
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    useSingletonComponent,
} from '../../ecs'
import { drawPath } from '../../pixi'
import { canvasTheme } from '../../ui'

type PolygonToolState = 'default' | 'drawing'

export type PolygonToolProps = {
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
}

export const PolygonTool = ({
    newShapeCollisionGroup,
    newShapeCollisionMask,
}: PolygonToolProps) => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const pointer = useSingletonComponent(PointerComponent)

    const toolState = useRef<PolygonToolState>('default')
    const polygonPoints = useRef<[number, number][]>([])

    useEffect(() => {
        if (!pixi || !physicsWorld || !pointer) return

        const { world } = physicsWorld

        const updateGraphics = () => {
            const { drawShape: graphics } = pixi.graphics
            graphics.clear()

            if (toolState.current === 'default') return

            drawPath({
                graphics,
                path: polygonPoints.current.map((point) => [...point]),
                lineColor: canvasTheme.bodies.drawing.lineColor,
                lineWidth: canvasTheme.lineWidth,
            })
        }

        const onUpHandler = () => {
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
                            if (newShapeCollisionMask) {
                                s.collisionMask = newShapeCollisionMask
                            }
                            if (newShapeCollisionGroup) {
                                s.collisionGroup = newShapeCollisionGroup
                            }
                        }

                        world.addBody(body)
                    }
                }

                polygonPoints.current = []
                toolState.current = 'default'
                updateGraphics()
            }
        }

        const onDownHandler = () => {
            toolState.current = 'drawing'
            polygonPoints.current = [
                [...pointer.primaryPointer.physicsPosition],
            ]
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
                polygonPoints.current.push([
                    ...pointer.primaryPointer.physicsPosition,
                ])
                updateGraphics()
            }
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
