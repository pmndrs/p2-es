import * as PIXI from 'pixi.js'
import { RES_SCALAR } from './constants'

export type DrawPathProps = {
    graphics: PIXI.Graphics
    path: number[][]
    lineColor: number
    fillColor?: number
    lineWidth: number
    isSleeping?: boolean
    sleepOpacity?: number
}

export const drawPath = ({
    graphics,
    path,
    lineColor,
    fillColor,
    lineWidth,
    isSleeping,
    sleepOpacity,
}: DrawPathProps) => {
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
                const area =
                    (p2x - p1x) * (p3y - p1y) - (p3x - p1x) * (p2y - p1y)
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
