import { World } from 'arancini'
import { createReactAPI } from 'arancini/react'
import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { App } from './app'
import {
    Entity,
    PhysicsAABBRendererSystem,
    PhysicsBodyRendererSystem,
    PhysicsContactRendererSystem,
    PhysicsSpringRendererSystem,
    PointerSystem,
    createPointer,
} from './ecs'
import { PhysicsSystem } from './ecs/physics-system'
import { createPixiApp } from './pixi'
import { SandboxConfig, SandboxContext, SandboxFunction, Scenes } from './sandbox'
import { Executor } from 'arancini/systems'

const CONSOLE_MESSAGE = `
=== p2-es ===
Welcome to the p2-es sandbox environment!
Did you know you can interact with the physics world here in the console? Try executing the following:

/* set world gravity */
world.gravity[1] = 10;

/* add a body */
const body = new p2.Body({
    mass: 1,
});

body.addShape(new p2.Circle({
    radius: 1,
}));

world.addBody(body);
`

export { Tools, type Tool } from './ecs'
export type { SandboxConfig, SandboxContext, SandboxFunction, Scenes }

export type SandboxProps = {
    title?: string
    codeLink?: string
    /** @default true */
    showHeader?: boolean
    /** @default true */
    showControls?: boolean
    /** @default true */
    enablePanning?: boolean
    /** @default true */
    enableZooming?: boolean
}

export class Sandbox {
    root?: ReactDOM.Root

    private cleanup?: () => void

    constructor(private setup: SandboxFunction | Scenes, private config?: SandboxProps) {}

    mount(domElement: HTMLElement): this {
        if (!this.root) {
            const world = new World<Entity>()
            const executor = new Executor(world)
            const react = createReactAPI(world)

            const { destroy: destroyPixi, ...pixi } = createPixiApp()
            const pixiEntity = world.create({ pixi })

            const pointerEntity = world.create({ pointer: createPointer() })

            const domElementEntity = world.create({ domElement })

            executor.add(PhysicsSystem)
            executor.add(PointerSystem)
            executor.add(PhysicsSpringRendererSystem)
            executor.add(PhysicsContactRendererSystem)
            executor.add(PhysicsBodyRendererSystem)
            executor.add(PhysicsAABBRendererSystem)

            executor.init()

            this.cleanup = () => {
                destroyPixi()

                world.destroy(pixiEntity)
                world.destroy(domElementEntity)
                world.destroy(pointerEntity)
            }

            this.root = ReactDOM.createRoot(domElement)

            const configProps = {
                showControls: true,
                showHeader: true,
                ...this.config,
            }

            this.root.render(<App ecs={{
                world,
                executor,
                react,
            }} setup={this.setup} {...configProps} />)

            console.log(CONSOLE_MESSAGE)
        }

        return this
    }

    unmount(): void {
        if (this.root) {
            this.cleanup?.()
            this.cleanup = undefined

            this.root.unmount()
            this.root = undefined
        }
    }
}
