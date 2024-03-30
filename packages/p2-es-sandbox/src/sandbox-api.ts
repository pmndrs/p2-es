import type { World } from 'p2-es'
import { Tool } from './ecs'
import { Pixi, Pointer, SandboxSettings } from './ecs/entity'

export type SandboxContext = {
    pixi: Pixi

    pointer: Pointer

    centerCamera: (x: number, y: number) => void

    frame: (centerX: number, centerY: number, width: number, height: number) => void

    onUpdate: {
        add: (callback: () => void) => void
        remove: (callback: () => void) => void
    }
}

export type Scenes = Record<string, { setup: SandboxFunction }>

export type SandboxToolsConfig = {
    default?: Tool
}

export type SandboxConfig = {
    world: World
    onDestroy?: () => void
    tools?: SandboxToolsConfig
    settings?: Partial<SandboxSettings>
}

export type SandboxFunction = (context: SandboxContext) => SandboxConfig

export type CreateSandboxProps = {
    pixi: Pixi
    pointer: Pointer
    sandboxFunction: SandboxFunction
}

export const createSandbox = ({ pixi, pointer, sandboxFunction }: CreateSandboxProps) => {
    const { application, container } = pixi

    const updateHandlers = new Set<(delta: number) => void>()

    const centerCamera = (x: number, y: number) => {
        container.position.x = application.renderer.width / 2 - container.scale.x * x
        container.position.y = application.renderer.height / 2 - container.scale.y * y
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

    const { world, tools, settings, onDestroy } = sandboxFunction(sandboxContext)

    const destroySandbox = () => {
        if (onDestroy) {
            onDestroy()
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
