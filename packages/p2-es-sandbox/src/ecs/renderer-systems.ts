import { System } from 'arancini'
import * as p2 from 'p2-es'
import { randomPastelHex } from '../color'
import { drawRenderable } from '../pixi'
import { canvasTheme } from '../ui'
import {
    PhysicsBodyComponent,
    PhysicsSpringComponent,
    PhysicsWorldComponent,
    PixiComponent,
    SettingsComponent,
    SpriteComponent,
} from './components'

export class PhysicsAABBRendererSystem extends System {
    pixi = this.singleton(PixiComponent)
    physicsWorld = this.singleton(PhysicsWorldComponent)
    settings = this.singleton(SettingsComponent)

    onUpdate(_delta: number, _time: number): void {
        if (!this.pixi || !this.settings || !this.physicsWorld) return

        const { drawAABBs } = this.settings
        const { graphics, container } = this.pixi

        if (drawAABBs) {
            graphics.aabb.clear()
            container.removeChild(graphics.aabb)
            container.addChild(graphics.aabb)

            const g = graphics.aabb
            g.lineStyle(canvasTheme.lineWidth, canvasTheme.aabb.lineColor, 1)

            for (let i = 0; i !== this.physicsWorld.bodies.length; i++) {
                const aabb = this.physicsWorld.bodies[i].getAABB()
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
    }
}

export class PhysicsBodyRendererSystem extends System {
    pixi = this.singleton(PixiComponent)
    settings = this.singleton(SettingsComponent)

    uninitialised = this.query({
        all: [PhysicsBodyComponent],
        not: [SpriteComponent],
    })

    renderable = this.query([PhysicsBodyComponent, SpriteComponent])

    bodyIdToColor: { [body: number]: number } = {}
    islandIdToColor: { [body: number]: number } = {}

    onUpdate(): void {
        if (!this.settings || !this.pixi) {
            return
        }

        const {
            renderInterpolatedPositions: useInterpolatedPositions,
            paused,
            bodyIslandColors,
            bodySleepOpacity,
            debugPolygons,
        } = this.settings
        const { container } = this.pixi

        for (const entity of this.uninitialised) {
            const { graphics } = entity.add(SpriteComponent)
            container.addChild(graphics)
        }

        for (const entity of this.renderable) {
            const body = entity.get(PhysicsBodyComponent)
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
            graphics.zIndex = body.type === p2.Body.STATIC ? 0 : 1

            // update graphics if body changed sleepState or island
            const isSleeping = body.sleepState === p2.Body.SLEEPING
            let color: number
            if (bodyIslandColors) {
                color = this.getIslandColor(body)
            } else {
                color = this.getBodyColor(body)
            }

            if (sprite.drawnSleeping !== isSleeping || sprite.drawnFillColor !== color || sprite.dirty) {
                sprite.dirty = false

                graphics.clear()
                drawRenderable({
                    renderable: body,
                    sprite,
                    fillColor: color,
                    lineColor: sprite.drawnLineColor ?? canvasTheme.body.lineColor,
                    debugPolygons,
                    lineWidth: canvasTheme.lineWidth,
                    sleepOpacity: bodySleepOpacity ? canvasTheme.body.sleeping.opacity : 1,
                })
            }
        }
    }

    getIslandColor(body: p2.Body) {
        if (body.islandId === -1) {
            return canvasTheme.body.static.fillColor // Gray for static objects
        }

        let color = this.islandIdToColor[body.islandId]
        if (color) return color

        color = parseInt(randomPastelHex(), 16)
        this.islandIdToColor[body.islandId] = color
        return color
    }

    getBodyColor(body: p2.Body) {
        if (body.type === p2.Body.STATIC) {
            return canvasTheme.body.static.fillColor // Gray for static objects
        }

        let color = this.bodyIdToColor[body.id]
        if (color) return color

        color = parseInt(randomPastelHex(), 16)
        this.bodyIdToColor[body.id] = color
        return color
    }
}

export class PhysicsContactRendererSystem extends System {
    pixi = this.singleton(PixiComponent)
    physicsWorld = this.singleton(PhysicsWorldComponent)
    settings = this.singleton(SettingsComponent)

    onUpdate(): void {
        if (!this.settings || !this.pixi || !this.physicsWorld) return

        const { drawContacts } = this.settings
        const { graphics, container } = this.pixi

        if (drawContacts) {
            graphics.contacts.clear()
            container.removeChild(graphics.contacts)
            container.addChild(graphics.contacts)

            const g = graphics.contacts
            g.lineStyle(canvasTheme.lineWidth, canvasTheme.contact.lineColor, 1)
            for (let i = 0; i !== this.physicsWorld.narrowphase.contactEquations.length; i++) {
                const eq = this.physicsWorld.narrowphase.contactEquations[i]
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
    }
}

export class PhysicsSpringRendererSystem extends System {
    pixi = this.singleton(PixiComponent)
    settings = this.singleton(SettingsComponent)

    uninitialised = this.query({
        all: [PhysicsSpringComponent],
        not: [SpriteComponent],
    })

    renderable = this.query([PhysicsSpringComponent, SpriteComponent])

    onUpdate(): void {
        if (!this.settings || !this.pixi) return

        const { renderInterpolatedPositions, paused } = this.settings
        const { container } = this.pixi

        for (const entity of this.uninitialised) {
            const spring = entity.get(PhysicsSpringComponent)
            const sprite = entity.add(SpriteComponent)

            if (spring instanceof p2.LinearSpring) {
                drawRenderable({
                    sprite,
                    renderable: spring,
                    lineColor: canvasTheme.spring.lineColor,
                    lineWidth: canvasTheme.lineWidth,
                })
            }

            container.addChild(sprite.graphics)
        }

        for (const entity of this.renderable) {
            const spring = entity.get(PhysicsSpringComponent)
            const sprite = entity.get(SpriteComponent)
            const { graphics } = sprite

            if (spring instanceof p2.LinearSpring) {
                const bA = spring.bodyA
                const bB = spring.bodyB

                let worldAnchorA = p2.vec2.fromValues(0, 0)
                let worldAnchorB = p2.vec2.fromValues(0, 0)
                const X = p2.vec2.fromValues(1, 0)
                const distVec = p2.vec2.fromValues(0, 0)

                if (renderInterpolatedPositions && !paused) {
                    p2.vec2.toGlobalFrame(worldAnchorA, spring.localAnchorA, bA.interpolatedPosition, bA.interpolatedAngle)
                    p2.vec2.toGlobalFrame(worldAnchorB, spring.localAnchorB, bB.interpolatedPosition, bB.interpolatedAngle)
                } else {
                    spring.getWorldAnchorA(worldAnchorA)
                    spring.getWorldAnchorB(worldAnchorB)
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
                const clampedRestLength = spring.restLength > 0.1 ? spring.restLength : 0.1
                graphics.scale.x = p2.vec2.length(distVec) / clampedRestLength
            }
        }
    }
}
