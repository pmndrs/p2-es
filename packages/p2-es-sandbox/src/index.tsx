import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { world } from './ecs'
import { createPixiApp } from './pixi'
import { Sandbox as SandboxComponent } from './sandbox'
import { SandboxConfig, SandboxContext, SandboxFunction, Scenes } from './sandbox-api'
import { usePixiStore } from './state'
import { styledComponentsTheme } from './ui'

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

export { Tool } from './tools'
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
            world.clear()

            const { destroy: destroyPixi, ...pixi } = createPixiApp()
            usePixiStore.setState(pixi)

            this.cleanup = () => {
                destroyPixi()
            }

            this.root = ReactDOM.createRoot(domElement)

            const configProps = {
                showControls: true,
                showHeader: true,
                ...this.config,
            }

            this.root.render(
                <ThemeProvider theme={styledComponentsTheme}>
                    <SandboxComponent setup={this.setup} {...configProps} />
                </ThemeProvider>
            )

            console.log(CONSOLE_MESSAGE)
        }

        return this
    }

    unmount(): void {
        if (this.root) {
            world.clear()

            this.cleanup?.()
            this.cleanup = undefined

            this.root.unmount()
            this.root = undefined
        }
    }
}
