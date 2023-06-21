import * as PIXI from 'pixi.js'
import * as p2 from 'p2-es'
import { RES_SCALAR } from '../constants'

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
