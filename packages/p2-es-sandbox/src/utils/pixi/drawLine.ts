import * as PIXI from 'pixi.js'
import * as p2 from 'p2-es'

export type DrawLineProps = {
    graphics: PIXI.Graphics
    offset: p2.Vec2
    angle: number
    len: number
    lineColor: number
    lineWidth: number
}

export const drawLine = ({
    graphics,
    offset,
    angle,
    len,
    lineColor,
    lineWidth,
}: DrawLineProps) => {
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
