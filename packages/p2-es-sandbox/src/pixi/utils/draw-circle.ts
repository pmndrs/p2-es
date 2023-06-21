import * as PIXI from 'pixi.js'
import { RES_SCALAR } from '../constants'

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
