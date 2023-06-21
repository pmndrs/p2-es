import * as PIXI from 'pixi.js'

export type DrawSpringProps = {
    graphics: PIXI.Graphics
    restLength: number
    lineColor: number
    lineWidth: number
}

export const drawSpring = ({
    graphics,
    restLength,
    lineColor,
    lineWidth,
}: DrawSpringProps) => {
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
