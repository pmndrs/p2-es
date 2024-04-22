import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { useQuery, world } from '../ecs'
import { useFrame } from '../hooks/use-frame'
import { usePhysicsWorldStore, usePixiStore, useSandboxSettings } from '../state'
import { canvasTheme } from '../ui'
import { drawRenderable } from './draw'
import { createSprite } from './sprite'

const componentToHex = (c: number) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

const rgbToHex = (r: number, g: number, b: number) => {
    return componentToHex(r) + componentToHex(g) + componentToHex(b)
}

const randomPastelHex = () => {
    const mix = [255, 255, 255]
    let red = Math.floor(Math.random() * 256)
    let green = Math.floor(Math.random() * 256)
    let blue = Math.floor(Math.random() * 256)

    // mix the color
    red = Math.floor((red + 3 * mix[0]) / 4)
    green = Math.floor((green + 3 * mix[1]) / 4)
    blue = Math.floor((blue + 3 * mix[2]) / 4)

    return rgbToHex(red, green, blue)
}

export const PhysicsAABBRenderer = () => {
    const pixi = usePixiStore()
    const { world: physics } = usePhysicsWorldStore()
    const settings = useSandboxSettings()

    useFrame(() => {
        if (!physics) return
        const { drawAABBs } = settings
        const { graphics, container } = pixi

        if (drawAABBs) {
            graphics.aabb.clear()
            container.removeChild(graphics.aabb)
            container.addChild(graphics.aabb)

            const g = graphics.aabb
            g.lineStyle(canvasTheme.lineWidth, canvasTheme.aabb.lineColor, 1)

            for (let i = 0; i !== physics.bodies.length; i++) {
                const aabb = physics.bodies[i].getAABB()
                g.drawRect(
                    aabb.lowerBound[0],
                    aabb.lowerBound[1],
                    aabb.upperBound[0] - aabb.lowerBound[0],
                    aabb.upperBound[1] - aabb.lowerBound[1]
                )
            }
        } else {
            graphics.aabb.clear()
        }
    })

    return null
}

export const PhysicsBodyRenderer = () => {
    const pixi = usePixiStore()
    const settings = useSandboxSettings()

    const uninitialised = useQuery((e) => e.has('physicsBody').but.without('sprite'))

    const renderable = useQuery((e) => e.has('physicsBody', 'sprite'))

    const bodyIdToColor = useRef<Record<number, number>>({})
    const islandIdToColor = useRef<Record<number, number>>({})

    useEffect(
        renderable.onEntityRemoved.add((entity) => {
            const { sprite } = entity
            if (!sprite) return

            pixi.container.removeChild(sprite.graphics)
        }),
        []
    )

    useFrame(() => {
        const {
            renderInterpolatedPositions: useInterpolatedPositions,
            paused,
            bodyIslandColors,
            bodySleepOpacity,
            debugPolygons,
        } = settings

        const { container } = pixi

        for (const entity of uninitialised) {
            world.add(entity, 'sprite', createSprite())
            container.addChild(entity.sprite!.graphics)
        }

        for (const entity of renderable) {
            const { physicsBody, sprite } = entity
            const { graphics } = sprite

            // update body transform
            if (useInterpolatedPositions && !paused) {
                const [x, y] = physicsBody.interpolatedPosition
                graphics.position.x = x
                graphics.position.y = y
                graphics.rotation = physicsBody.interpolatedAngle
            } else {
                const [x, y] = physicsBody.position
                graphics.position.x = x
                graphics.position.y = y
                graphics.rotation = physicsBody.angle
            }

            // update zIndex
            graphics.zIndex = physicsBody.type === p2.Body.STATIC ? 0 : 1

            // update graphics if body changed sleepState or island
            const isSleeping = physicsBody.sleepState === p2.Body.SLEEPING
            let color: number
            if (bodyIslandColors) {
                color = getIslandColor(physicsBody)
            } else {
                color = getBodyColor(physicsBody)
            }

            if (sprite.drawnSleeping !== isSleeping || sprite.drawnFillColor !== color || sprite.dirty) {
                sprite.dirty = false

                graphics.clear()
                drawRenderable({
                    sprite,
                    debugPolygons,
                    renderable: physicsBody,
                    fillColor: color,
                    lineColor: sprite.drawnLineColor ?? canvasTheme.body.lineColor,
                    lineWidth: canvasTheme.lineWidth,
                    sleepOpacity: bodySleepOpacity ? canvasTheme.body.sleeping.opacity : 1,
                })
            }
        }
    })

    const getIslandColor = (body: p2.Body) => {
        if (body.islandId === -1) {
            return canvasTheme.body.static.fillColor // Gray for static objects
        }

        let color = islandIdToColor.current[body.islandId]
        if (color) return color

        color = parseInt(randomPastelHex(), 16)
        islandIdToColor.current[body.islandId] = color
        return color
    }

    const getBodyColor = (body: p2.Body) => {
        if (body.type === p2.Body.STATIC) {
            return canvasTheme.body.static.fillColor // Gray for static objects
        }

        let color = bodyIdToColor.current[body.id]
        if (color) return color

        color = parseInt(randomPastelHex(), 16)
        bodyIdToColor.current[body.id] = color
        return color
    }

    return null
}

export const PhysicsContactRenderer = () => {
    const pixi = usePixiStore()
    const { world: physics } = usePhysicsWorldStore()
    const settings = useSandboxSettings()

    useFrame(() => {
        if (!physics) return

        const { drawContacts } = settings
        const { graphics, container } = pixi

        if (drawContacts) {
            graphics.contacts.clear()
            container.removeChild(graphics.contacts)
            container.addChild(graphics.contacts)

            const g = graphics.contacts
            g.lineStyle(canvasTheme.lineWidth, canvasTheme.contact.lineColor, 1)
            for (let i = 0; i !== physics.narrowphase.contactEquations.length; i++) {
                const eq = physics.narrowphase.contactEquations[i]
                const bi = eq.bodyA
                const bj = eq.bodyB
                const ri = eq.contactPointA
                const rj = eq.contactPointB
                const xi = bi.position[0]
                const yi = bi.position[1]
                const xj = bj.position[0]
                const yj = bj.position[1]

                g.moveTo(xi, yi)
                g.lineTo(xi + ri[0], yi + ri[1])

                g.moveTo(xj, yj)
                g.lineTo(xj + rj[0], yj + rj[1])
            }
        } else {
            graphics.contacts.clear()
        }
    })

    return null
}

export const PhysicsSpringRenderer = () => {
    const pixi = usePixiStore()
    const settings = useSandboxSettings()

    const uninitialised = useQuery((e) => e.has('physicsSpring').but.without('sprite'))
    const renderable = useQuery((e) => e.has('physicsSpring', 'sprite'))

    useEffect(
        renderable.onEntityRemoved.add((entity) => {
            const { sprite } = entity
            if (!sprite) return

            pixi.container.removeChild(sprite.graphics)
        }),
        []
    )

    useFrame(() => {
        if (!world) return

        const { renderInterpolatedPositions, paused } = settings
        const { container } = pixi

        for (const entity of uninitialised) {
            const { physicsSpring } = entity
            const sprite = createSprite()
            world.update(entity, {
                sprite,
            })

            if (physicsSpring instanceof p2.LinearSpring) {
                drawRenderable({
                    sprite,
                    renderable: physicsSpring,
                    lineColor: canvasTheme.spring.lineColor,
                    lineWidth: canvasTheme.lineWidth,
                })
            }

            container.addChild(sprite.graphics)
        }

        for (const entity of renderable) {
            const { physicsSpring, sprite } = entity
            const { graphics } = sprite

            if (physicsSpring instanceof p2.LinearSpring) {
                const bA = physicsSpring.bodyA
                const bB = physicsSpring.bodyB

                let worldAnchorA = p2.vec2.fromValues(0, 0)
                let worldAnchorB = p2.vec2.fromValues(0, 0)
                const X = p2.vec2.fromValues(1, 0)
                const distVec = p2.vec2.fromValues(0, 0)

                if (renderInterpolatedPositions && !paused) {
                    p2.vec2.toGlobalFrame(worldAnchorA, physicsSpring.localAnchorA, bA.interpolatedPosition, bA.interpolatedAngle)
                    p2.vec2.toGlobalFrame(worldAnchorB, physicsSpring.localAnchorB, bB.interpolatedPosition, bB.interpolatedAngle)
                } else {
                    physicsSpring.getWorldAnchorA(worldAnchorA)
                    physicsSpring.getWorldAnchorB(worldAnchorB)
                }

                graphics.scale.y = 1
                if (worldAnchorA[1] < worldAnchorB[1]) {
                    const tmp = worldAnchorA
                    worldAnchorA = worldAnchorB
                    worldAnchorB = tmp
                    graphics.scale.y = -1
                }

                const sxA = worldAnchorA[0]
                const syA = worldAnchorA[1]
                const sxB = worldAnchorB[0]
                const syB = worldAnchorB[1]

                // Spring position is the mean point between the anchors
                graphics.position.x = (sxA + sxB) / 2
                graphics.position.y = (syA + syB) / 2

                // Compute distance vector between anchors, in screen coords
                distVec[0] = sxA - sxB
                distVec[1] = syA - syB

                // Compute angle
                graphics.rotation = Math.acos(p2.vec2.dot(X, distVec) / p2.vec2.length(distVec))

                // And scale
                const clampedRestLength = physicsSpring.restLength > 0.1 ? physicsSpring.restLength : 0.1
                graphics.scale.x = p2.vec2.length(distVec) / clampedRestLength
            }
        }
    })

    return null
}
