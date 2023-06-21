import { Pixi, PointerComponent } from '../../ecs'
import { SandboxContext, SandboxFunction } from '../types'

export type SandboxRunnerProps = {
    pixi: Pixi
    pointer: PointerComponent
    sandboxFunction: SandboxFunction
}

export const sandboxRunner = ({
    pixi,
    pointer,
    sandboxFunction,
}: SandboxRunnerProps) => {
    const { application, container } = pixi

    const updateHandlers = new Set<(delta: number) => void>()

    const centerCamera = (x: number, y: number) => {
        container.position.x =
            application.renderer.width / 2 - container.scale.x * x
        container.position.y =
            application.renderer.height / 2 - container.scale.y * y
    }

    const frame = (x: number, y: number, w: number, h: number) => {
        const ratio = application.renderer.width / application.renderer.height
        if (ratio < w / h) {
            container.scale.x = application.renderer.width / w
            container.scale.y = -container.scale.x
        } else {
            container.scale.y = -application.renderer.height / h
            container.scale.x = -container.scale.y
        }
        centerCamera(x, y)
    }

    const onUpdate = {
        add: (fn: (delta: number) => void) => {
            updateHandlers.add(fn)
        },
        remove: (fn: (delta: number) => void) => {
            updateHandlers.delete(fn)
        },
    }

    const sandboxContext: SandboxContext = {
        pixi,
        pointer,
        centerCamera,
        frame,
        onUpdate,
    }

    // default view
    frame(0, 0, 8, 6)

    const { world, tools, settings, teardown } = sandboxFunction(sandboxContext)

    const destroySandbox = () => {
        if (teardown) {
            teardown()
        }
    }

    return {
        world,
        tools,
        settings,
        updateHandlers,
        sandboxContext,
        destroySandbox,
    }
}
