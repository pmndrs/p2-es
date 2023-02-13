import { Component } from 'arancini'
import { Graphics } from 'pixi.js'

export class SpriteComponent extends Component {
    graphics!: Graphics

    drawnSleeping!: boolean | null

    drawnLineColor!: number | null

    drawnFillColor!: number | null

    dirty!: boolean

    construct() {
        this.graphics = new Graphics()
        this.drawnSleeping = null
        this.drawnLineColor = null
        this.drawnFillColor = null
        this.dirty = false
    }

    onDestroy(): void {
        this.graphics.destroy()
    }
}
