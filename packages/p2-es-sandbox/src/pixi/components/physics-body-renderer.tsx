import { Body, Shape } from 'p2-es'
import { useCallback, useEffect } from 'react'
import { randomPastelHex } from '../../color/utils/random-pastel-hex'
import {
    PhysicsBodyComponent,
    PixiComponent,
    STAGES,
    SettingsComponent,
    SpriteComponent,
    ecs,
    useFrame,
    useSingletonComponent,
} from '../../ecs'
import { useConst } from '../../hooks'
import { canvasTheme } from '../../ui'
import { drawRenderable } from '../utils'

export const PhysicsBodyRenderer = () => {
    const pixi = useSingletonComponent(PixiComponent)
    const settings = useSingletonComponent(SettingsComponent)

    const uninitialised = ecs.useQuery({
        all: [PhysicsBodyComponent],
        not: [SpriteComponent],
    })
    const renderable = ecs.useQuery([PhysicsBodyComponent, SpriteComponent])

    const bodyIdToColor = useConst<{ [body: number]: number }>(() => ({}))
    const islandIdToColor = useConst<{ [body: number]: number }>(() => ({}))

    const getIslandColor = useCallback((body: Body) => {
        if (body.islandId === -1) {
            return canvasTheme.bodies.static.fillColor // Gray for static objects
        }

        let color = islandIdToColor[body.islandId]
        if (color) {
            return color
        }
        color = parseInt(randomPastelHex(), 16)
        islandIdToColor[body.islandId] = color

        return color
    }, [])

    const getBodyColor = useCallback((body: Body) => {
        if (body.type === Body.STATIC) {
            return canvasTheme.bodies.static.fillColor // Gray for static objects
        }

        let color = bodyIdToColor[body.id]
        if (color) {
            return color
        }
        color = parseInt(randomPastelHex(), 16)
        bodyIdToColor[body.id] = color

        return color
    }, [])

    useEffect(() => {
        renderable.entities.forEach((e) => {
            const { body } = e.get(PhysicsBodyComponent)
            if (body.shapes.some((s) => s.type === Shape.CONVEX)) {
                e.get(SpriteComponent).dirty = true
            }
        })
    }, [settings?.debugPolygons])

    useEffect(() => {
        renderable.entities.forEach((e) => {
            e.get(SpriteComponent).dirty = true
        })
    }, [settings?.bodySleepOpacity])

    useFrame(() => {
        if (!settings || !pixi) {
            return
        }

        const {
            renderInterpolatedPositions: useInterpolatedPositions,
            paused,
            bodyIslandColors,
            bodySleepOpacity,
            debugPolygons,
        } = settings
        const { container } = pixi

        for (const entity of uninitialised.entities) {
            const { graphics } = entity.add(SpriteComponent)
            container.addChild(graphics)
        }

        for (const entity of renderable.entities) {
            const { body } = entity.get(PhysicsBodyComponent)
            const sprite = entity.get(SpriteComponent)
            const { graphics } = sprite

            // update body transform
            if (useInterpolatedPositions && !paused) {
                const [x, y] = body.interpolatedPosition
                graphics.position.x = x
                graphics.position.y = y
                graphics.rotation = body.interpolatedAngle
            } else {
                const [x, y] = body.position
                graphics.position.x = x
                graphics.position.y = y
                graphics.rotation = body.angle
            }

            // update zIndex
            graphics.zIndex = body.type === Body.STATIC ? 0 : 1

            // update graphics if body changed sleepState or island
            const isSleeping = body.sleepState === Body.SLEEPING
            let color: number
            if (bodyIslandColors) {
                color = getIslandColor(body)
            } else {
                color = getBodyColor(body)
            }

            if (
                sprite.drawnSleeping !== isSleeping ||
                sprite.drawnFillColor !== color ||
                sprite.dirty
            ) {
                sprite.dirty = false

                graphics.clear()
                drawRenderable({
                    renderable: body,
                    sprite,
                    fillColor: color,
                    lineColor:
                        sprite.drawnLineColor ?? canvasTheme.bodies.lineColor,
                    debugPolygons,
                    lineWidth: canvasTheme.lineWidth,
                    sleepOpacity: bodySleepOpacity
                        ? canvasTheme.bodies.sleeping.opacity
                        : 1,
                })
            }
        }
    }, STAGES.RENDER_BODIES)

    return null
}
