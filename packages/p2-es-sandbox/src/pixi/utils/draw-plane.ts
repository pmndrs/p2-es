import * as PIXI from 'pixi.js'

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
