import type { World } from 'p2-es'
import { Pixi, PointerComponent, SandboxSettings } from '../../ecs'
import { Tool } from '../../tools'

export type SandboxContext = {
    pixi: Pixi

    pointer: PointerComponent

    centerCamera: (x: number, y: number) => void

    frame: (
        centerX: number,
        centerY: number,
        width: number,
        height: number
    ) => void

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
    teardown?: () => void
    tools?: SandboxToolsConfig
    settings?: Partial<SandboxSettings>
}

export type SandboxFunction = (context: SandboxContext) => SandboxConfig
