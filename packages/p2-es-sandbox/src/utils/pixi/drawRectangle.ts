import * as PIXI from 'pixi.js'
import * as p2 from 'p2-es'
import { drawPath } from './drawPath'

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
