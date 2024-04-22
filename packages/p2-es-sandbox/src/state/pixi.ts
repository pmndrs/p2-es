import { Application, Container, Graphics } from 'pixi.js'
import { create } from 'zustand'

export type Pixi = {
    canvasElement: HTMLCanvasElement
    application: Application
    stage: Container
    container: Container
    background: Graphics
    graphics: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
        drawShape: Graphics
    }
    onResize: () => void
}


export const usePixiStore = create<Pixi>(() => null!)
