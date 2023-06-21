import '@pixi/events'
import { Application, Container, Graphics } from 'pixi.js'
import { Pixi } from '../../ecs'
import { canvasTheme } from '../../ui/constants/canvas-theme'

export const initPixi = (
    canvasDomElement: HTMLElement
): Pixi & { destroyPixi: () => void } => {
    // set tabIndex to enable keyboard events
    canvasDomElement.tabIndex = 0

    const canvasElement = document.createElement('canvas')
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'
    canvasDomElement.appendChild(canvasElement)

    const application = new Application({
        backgroundColor: canvasTheme.background,
        antialias: true,
        width: 1280,
        height: 720,
        view: canvasElement,
    })

    const stage = new Container()
    stage.interactive = true
    application.stage = stage

    const container = new Container()
    container.scale.x = 200
    container.scale.y = -200 // Flip Y direction.
    container.sortableChildren = true

    const background = new Graphics()

    const graphics = {
        aabb: new Graphics(),
        contacts: new Graphics(),
        pick: new Graphics(),
        drawShape: new Graphics(),
    }

    graphics.contacts.zIndex = 1
    graphics.aabb.zIndex = 2
    graphics.drawShape.zIndex = 3
    graphics.pick.zIndex = 4

    stage.addChild(background)
    stage.addChild(container)

    container.addChild(graphics.aabb)
    container.addChild(graphics.contacts)
    container.addChild(graphics.pick)
    container.addChild(graphics.drawShape)

    const onResize = () => {
        if (!application.stage) return

        const dpr = window.devicePixelRatio || 1
        const rect = canvasDomElement.getBoundingClientRect()
        const w = rect.width * dpr
        const h = rect.height * dpr

        application.renderer.resize(w, h)

        background.clear()
        background.beginFill(canvasTheme.background)
        background.drawRect(
            0,
            0,
            application.renderer.view.width,
            application.renderer.view.height
        )
        background.endFill()
    }

    onResize()
    window.addEventListener('resize', onResize)

    const destroyPixi = () => {
        window.removeEventListener('resize', onResize)
        application.destroy()
        canvasElement.remove()
    }

    return {
        domElement: canvasDomElement,
        application,
        stage,
        container,
        graphics,
        background,
        canvasElement,
        onResize,
        destroyPixi,
    }
}
