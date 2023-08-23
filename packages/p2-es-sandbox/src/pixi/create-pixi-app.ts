import '@pixi/events'
import { Application, Container, Graphics } from 'pixi.js'
import { Pixi } from '../ecs/components'
import { canvasTheme } from '../ui'

export const createPixiApp = (): Pixi & { destroy: () => void } => {
    const canvasElement = document.createElement('canvas')
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'

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
        const rect = canvasElement.parentElement?.getBoundingClientRect() ?? { width: 0, height: 0}
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

    window.addEventListener('resize', onResize)

    const destroy = () => {
        window.removeEventListener('resize', onResize)
        application.destroy()
    }

    return {
        application,
        stage,
        container,
        graphics,
        background,
        canvasElement,
        onResize,
        destroy,
    }
}
