import { Graphics } from 'pixi.js'

export type Sprite = {
    graphics: Graphics
    drawnSleeping: boolean | null
    drawnLineColor: number | null
    drawnFillColor: number | null
    dirty: boolean
}

export const createSprite = () => {
    return {
        graphics: new Graphics(),
        drawnSleeping: null,
        drawnLineColor: null,
        drawnFillColor: null,
        dirty: false,
    }
}
