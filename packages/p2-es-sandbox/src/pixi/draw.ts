import * as p2 from 'p2-es'
import * as PIXI from 'pixi.js'
import { SpriteComponent } from '../ecs'

const RES_SCALAR = 20

export type DrawCapsuleProps = {
    graphics: PIXI.Graphics
    x: number
    y: number
    angle: number
    len: number
    radius: number
    lineColor: number
    fillColor?: number
    lineWidth: number
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawCapsule = ({
    graphics,
    x,
    y,
    angle,
    len,
    radius,
    lineColor,
    fillColor,
    lineWidth,
    isSleeping,
    sleepOpacity,
}: DrawCapsuleProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

    lineWidth *= RES_SCALAR
    x *= RES_SCALAR
    y *= RES_SCALAR
    radius *= RES_SCALAR
    len *= RES_SCALAR

    lineColor = typeof lineColor === 'undefined' ? 0x000000 : lineColor
    graphics.lineStyle(lineWidth, lineColor, 1)

    // Draw circles at ends
    const hl = len / 2
    graphics.beginFill(fillColor, isSleeping ? sleepOpacity : 1.0)
    const localPos = p2.vec2.fromValues(x, y)
    const p0 = p2.vec2.fromValues(-hl, 0)
    const p1 = p2.vec2.fromValues(hl, 0)
    p2.vec2.rotate(p0, p0, angle)
    p2.vec2.rotate(p1, p1, angle)
    p2.vec2.add(p0, p0, localPos)
    p2.vec2.add(p1, p1, localPos)
    graphics.drawCircle(p0[0], p0[1], radius)
    graphics.drawCircle(p1[0], p1[1], radius)
    graphics.endFill()

    // Draw rectangle
    const pp2 = p2.vec2.create()
    const p3 = p2.vec2.create()
    p2.vec2.set(p0, -hl, radius)
    p2.vec2.set(p1, hl, radius)
    p2.vec2.set(pp2, hl, -radius)
    p2.vec2.set(p3, -hl, -radius)

    p2.vec2.rotate(p0, p0, angle)
    p2.vec2.rotate(p1, p1, angle)
    p2.vec2.rotate(pp2, pp2, angle)
    p2.vec2.rotate(p3, p3, angle)

    p2.vec2.add(p0, p0, localPos)
    p2.vec2.add(p1, p1, localPos)
    p2.vec2.add(pp2, pp2, localPos)
    p2.vec2.add(p3, p3, localPos)

    graphics.lineStyle(lineWidth, lineColor, 0)
    graphics.beginFill(fillColor, isSleeping ? sleepOpacity : 1.0)
    graphics.moveTo(p0[0], p0[1])
    graphics.lineTo(p1[0], p1[1])
    graphics.lineTo(pp2[0], pp2[1])
    graphics.lineTo(p3[0], p3[1])
    graphics.endFill()

    // Draw lines in between
    for (let i = 0; i < 2; i++) {
        graphics.lineStyle(lineWidth, lineColor, 1)
        const sign = i === 0 ? 1 : -1
        p2.vec2.set(p0, -hl, sign * radius)
        p2.vec2.set(p1, hl, sign * radius)
        p2.vec2.rotate(p0, p0, angle)
        p2.vec2.rotate(p1, p1, angle)
        p2.vec2.add(p0, p0, localPos)
        p2.vec2.add(p1, p1, localPos)
        graphics.moveTo(p0[0], p0[1])
        graphics.lineTo(p1[0], p1[1])
    }

    graphics.scale.set(1 / RES_SCALAR)
}

export type DrawCircleProps = {
    graphics: PIXI.Graphics
    x: number
    y: number
    angle: number
    radius: number
    fillColor?: number
    lineColor: number
    lineWidth: number
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawCircle = ({
    graphics,
    x,
    y,
    angle,
    radius,
    fillColor,
    lineColor,
    lineWidth,
    isSleeping,
    sleepOpacity,
}: DrawCircleProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

    lineWidth *= RES_SCALAR
    x *= RES_SCALAR
    y *= RES_SCALAR
    radius *= RES_SCALAR

    graphics.lineStyle(lineWidth, lineColor, 1)

    if (fillColor) {
        graphics.beginFill(fillColor, isSleeping ? sleepOpacity : 1.0)
    }

    graphics.drawCircle(x, y, radius)

    if (fillColor) {
        graphics.endFill()
    }

    // line from center to edge
    graphics.moveTo(x, y)
    graphics.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))

    graphics.scale.set(1 / RES_SCALAR)
}

export type DrawConvexProps = {
    graphics: PIXI.Graphics
    verts: p2.Vec2[]
    lineColor: number
    fillColor?: number
    lineWidth: number
    debugPolygons?: boolean
    offset: p2.Vec2
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawConvex = ({
    graphics,
    verts,
    lineColor,
    fillColor,
    lineWidth,
    debugPolygons,
    offset,
    isSleeping,
    sleepOpacity,
}: DrawConvexProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

    lineWidth *= RES_SCALAR
    verts.map((v) => {
        v[0] *= RES_SCALAR
        v[1] *= RES_SCALAR
    })

    lineColor = typeof lineColor === 'undefined' ? 0x000000 : lineColor
    if (!debugPolygons) {
        graphics.lineStyle(lineWidth, lineColor, 1)
        graphics.beginFill(fillColor, isSleeping ? sleepOpacity : 1.0)
        for (let i = 0; i !== verts.length; i++) {
            const v = verts[i]
            const x = v[0]
            const y = v[1]
            if (i === 0) {
                graphics.moveTo(x, y)
            } else {
                graphics.lineTo(x, y)
            }
        }
        graphics.endFill()
        if (verts.length > 2) {
            graphics.moveTo(verts[verts.length - 1][0], verts[verts.length - 1][1])
            graphics.lineTo(verts[0][0], verts[0][1])
        }
    } else {
        // convexes
        const colors = [0xff0000, 0x00ff00, 0x0000ff]
        for (let i = 0; i !== verts.length + 1; i++) {
            const v0 = verts[i % verts.length]
            const v1 = verts[(i + 1) % verts.length]
            const x0 = v0[0]
            const y0 = v0[1]
            const x1 = v1[0]
            const y1 = v1[1]
            graphics.lineStyle(lineWidth, colors[i % colors.length], 1)
            graphics.moveTo(x0, y0)
            graphics.lineTo(x1, y1)
            graphics.drawCircle(x0, y0, lineWidth * 2)
        }

        graphics.lineStyle(lineWidth, 0xff0000, 1)
        graphics.drawCircle(offset[0], offset[1], lineWidth * 2)
    }

    graphics.scale.set(1 / RES_SCALAR)
}

export type DrawLineProps = {
    graphics: PIXI.Graphics
    offset: p2.Vec2
    angle: number
    len: number
    lineColor: number
    lineWidth: number
}

export const drawLine = ({ graphics, offset, angle, len, lineColor, lineWidth }: DrawLineProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
    lineColor = typeof lineColor === 'undefined' ? 0x000000 : lineColor
    graphics.lineStyle(lineWidth, lineColor, 1)

    const startPoint = p2.vec2.fromValues(-len / 2, 0)
    const endPoint = p2.vec2.fromValues(len / 2, 0)

    p2.vec2.rotate(startPoint, startPoint, angle)
    p2.vec2.rotate(endPoint, endPoint, angle)

    p2.vec2.add(startPoint, startPoint, offset)
    p2.vec2.add(endPoint, endPoint, offset)

    graphics.moveTo(startPoint[0], startPoint[1])
    graphics.lineTo(endPoint[0], endPoint[1])
}

export type DrawPathProps = {
    graphics: PIXI.Graphics
    path: number[][]
    lineColor: number
    fillColor?: number
    lineWidth: number
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawPath = ({ graphics, path, lineColor, fillColor, lineWidth, isSleeping, sleepOpacity }: DrawPathProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

    lineWidth *= RES_SCALAR
    path.map((p) => {
        p[0] *= RES_SCALAR
        p[1] *= RES_SCALAR
    })

    lineColor = typeof lineColor === 'undefined' ? 0x000000 : lineColor
    graphics.lineStyle(lineWidth, lineColor, 1)
    if (typeof fillColor === 'number') {
        graphics.beginFill(fillColor, isSleeping ? sleepOpacity : 1.0)
    }
    let lastx = null
    let lasty = null
    for (let i = 0; i < path.length; i++) {
        const v = path[i]
        const x = v[0]
        const y = v[1]
        if (x !== lastx || y !== lasty) {
            if (i === 0) {
                graphics.moveTo(x, y)
            } else {
                // Check if the lines are parallel
                const p1x = lastx as number
                const p1y = lasty as number
                const p2x = x
                const p2y = y
                const p3x = path[(i + 1) % path.length][0]
                const p3y = path[(i + 1) % path.length][1]
                const area = (p2x - p1x) * (p3y - p1y) - (p3x - p1x) * (p2y - p1y)
                if (area !== 0) {
                    graphics.lineTo(x, y)
                }
            }
            lastx = x
            lasty = y
        }
    }
    if (typeof fillColor === 'number') {
        graphics.endFill()
    }

    // Close the path
    if (path.length > 2 && typeof fillColor === 'number') {
        graphics.moveTo(path[path.length - 1][0], path[path.length - 1][1])
        graphics.lineTo(path[0][0], path[0][1])
    }

    graphics.scale.set(1 / RES_SCALAR)
}

export type DrawPlaneProps = {
    graphics: PIXI.Graphics
    x0: number
    x1: number
    lineColor: number
    fillColor?: number
    lineWidth?: number
    diagMargin: number
    diagSize: number
    maxLength: number
}

// todo: consider angle
export const drawPlane = ({
    graphics,
    x0: _x0,
    x1: _x1,
    lineColor,
    fillColor = 0xffffff,
    lineWidth = 1,
    diagMargin: _diagMargin,
    diagSize: _diagSize,
    maxLength,
}: DrawPlaneProps) => {
    graphics.lineStyle(lineWidth, lineColor, 1)

    // Draw a fill color
    graphics.lineStyle(0, 0, 0)
    graphics.beginFill(fillColor)
    const max = maxLength
    graphics.moveTo(-max, 0)
    graphics.lineTo(max, 0)
    graphics.lineTo(max, -max)
    graphics.lineTo(-max, -max)
    graphics.endFill()

    // Draw the actual plane
    graphics.lineStyle(lineWidth, lineColor)
    graphics.moveTo(-max, 0)
    graphics.lineTo(max, 0)
}

export type DrawRectangleProps = {
    graphics: PIXI.Graphics
    x: number
    y: number
    angle: number
    w: number
    h: number
    lineColor: number
    fillColor?: number
    lineWidth: number
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawRectangle = ({
    graphics,
    x,
    y,
    angle,
    w,
    h,
    lineColor,
    fillColor,
    lineWidth,
    isSleeping,
    sleepOpacity,
}: DrawRectangleProps) => {
    const path = [
        [w / 2, h / 2],
        [-w / 2, h / 2],
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
    ]

    // Rotate and add position
    for (let i = 0; i < path.length; i++) {
        const v = path[i]
        p2.vec2.rotate(v, v, angle)
        p2.vec2.add(v, v, [x, y])
    }

    drawPath({
        graphics,
        path,
        lineColor,
        fillColor,
        lineWidth,
        isSleeping,
        sleepOpacity,
    })
}

export type DrawSpringProps = {
    graphics: PIXI.Graphics
    restLength: number
    lineColor: number
    lineWidth: number
}

export const drawSpring = ({ graphics, restLength, lineColor, lineWidth }: DrawSpringProps) => {
    lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
    lineColor = typeof lineColor === 'undefined' ? 0xffffff : lineColor
    graphics.lineStyle(lineWidth, lineColor, 1)
    if (restLength < lineWidth * 10) {
        restLength = lineWidth * 10
    }
    const M = 12
    const dx = restLength / M
    graphics.moveTo(-restLength / 2, 0)
    for (let i = 1; i < M; i++) {
        const x = -restLength / 2 + dx * i
        let y = 0
        if (i <= 1 || i >= M - 1) {
            // Do nothing
        } else if (i % 2 === 0) {
            y -= 0.1 * restLength
        } else {
            y += 0.1 * restLength
        }
        graphics.lineTo(x, y)
    }
    graphics.lineTo(restLength / 2, 0)
}

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
