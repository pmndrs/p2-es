import * as p2 from 'p2-es'
import { SpriteComponent } from '../../ecs'
import { drawCapsule } from './draw-capsule'
import { drawCircle } from './draw-circle'
import { drawConvex } from './draw-convex'
import { drawLine } from './draw-line'
import { drawPath } from './draw-path'
import { drawPlane } from './draw-plane'
import { drawRectangle } from './draw-rectangle'
import { drawSpring } from './draw-spring'

export type DrawRenderableProps = {
    renderable: p2.Body | p2.LinearSpring
    sprite: SpriteComponent
    lineColor: number
    fillColor?: number
    lineWidth: number
    sleepOpacity?: number
    debugPolygons?: boolean
}

export const drawRenderable = ({
    renderable,
    sprite,
    lineColor,
    fillColor,
    lineWidth,
    debugPolygons,
    sleepOpacity,
}: DrawRenderableProps) => {
    sprite.drawnSleeping = false
    sprite.drawnFillColor = fillColor ?? null
    sprite.drawnLineColor = lineColor
    if (renderable instanceof p2.Body && renderable.shapes.length) {
        const isSleeping = renderable.sleepState === p2.Body.SLEEPING
        sprite.drawnSleeping = isSleeping

        const { concavePath } = renderable as unknown as {
            concavePath: p2.Vec2[] | undefined
        }

        if (concavePath && !debugPolygons) {
            const path = concavePath.map((v) => [v[0], v[1]])
            drawPath({
                graphics: sprite.graphics,
                path,
                lineColor,
                fillColor,
                isSleeping,
                sleepOpacity,
                lineWidth,
            })
        } else {
            for (let i = 0; i < renderable.shapes.length; i++) {
                const child = renderable.shapes[i]
                const offset = child.position
                const { angle } = child

                if (child instanceof p2.Circle) {
                    drawCircle({
                        graphics: sprite.graphics,
                        x: offset[0],
                        y: offset[1],
                        angle,
                        radius: child.radius,
                        lineColor,
                        fillColor,
                        lineWidth,
                        isSleeping,
                        sleepOpacity,
                    })
                } else if (child instanceof p2.Particle) {
                    drawCircle({
                        graphics: sprite.graphics,
                        x: offset[0],
                        y: offset[1],
                        angle,
                        radius: 2 * lineWidth,
                        lineColor,
                        fillColor,
                        lineWidth,
                        isSleeping,
                        sleepOpacity,
                    })
                } else if (child instanceof p2.Plane) {
                    // TODO use shape angle
                    drawPlane({
                        graphics: sprite.graphics,
                        x0: -10,
                        x1: 10,
                        lineColor,
                        fillColor,
                        lineWidth,
                        diagMargin: lineWidth * 10,
                        diagSize: lineWidth * 10,
                        maxLength: 100,
                    })
                } else if (child instanceof p2.Line) {
                    drawLine({
                        graphics: sprite.graphics,
                        offset,
                        angle,
                        len: child.length,
                        lineColor,
                        lineWidth,
                    })
                } else if (child instanceof p2.Box) {
                    drawRectangle({
                        graphics: sprite.graphics,
                        x: offset[0],
                        y: offset[1],
                        angle,
                        w: child.width,
                        h: child.height,
                        lineColor,
                        fillColor,
                        lineWidth,
                        isSleeping,
                        sleepOpacity,
                    })
                } else if (child instanceof p2.Capsule) {
                    drawCapsule({
                        graphics: sprite.graphics,
                        x: offset[0],
                        y: offset[1],
                        angle,
                        len: child.length,
                        radius: child.radius,
                        lineColor,
                        fillColor,
                        lineWidth,
                        isSleeping,
                        sleepOpacity,
                    })
                } else if (child instanceof p2.Convex) {
                    // Scale verts
                    const verts = []
                    const vrot = p2.vec2.create()
                    for (let j = 0; j !== child.vertices.length; j++) {
                        const v = child.vertices[j]
                        p2.vec2.rotate(vrot, v, angle)
                        verts.push([vrot[0] + offset[0], vrot[1] + offset[1]])
                    }

                    drawConvex({
                        graphics: sprite.graphics,
                        verts,
                        lineColor,
                        fillColor,
                        lineWidth,
                        debugPolygons,
                        offset,
                        isSleeping,
                        sleepOpacity,
                    })
                } else if (child instanceof p2.Heightfield) {
                    const path = [[0, -100]]
                    for (let j = 0; j !== child.heights.length; j++) {
                        const v = child.heights[j]
                        path.push([j * child.elementWidth, v])
                    }
                    path.push([child.heights.length * child.elementWidth, -100])

                    drawPath({
                        graphics: sprite.graphics,
                        path,
                        lineColor,
                        fillColor,
                        lineWidth,
                        isSleeping,
                        sleepOpacity,
                    })
                }
            }
        }
    } else if (renderable instanceof p2.LinearSpring) {
        const restLengthPixels = renderable.restLength

        drawSpring({
            graphics: sprite.graphics,
            restLength: restLengthPixels,
            lineColor,
            lineWidth,
        })
    }
}
