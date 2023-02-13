import * as PIXI from 'pixi.js'
import * as p2 from 'p2-es'
import { RES_SCALAR } from './constants'

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
            graphics.moveTo(
                verts[verts.length - 1][0],
                verts[verts.length - 1][1]
            )
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
