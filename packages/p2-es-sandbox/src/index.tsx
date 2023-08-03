import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { App } from './app'
import { SandboxFunction, Scenes } from './sandbox/types'

export * from './sandbox/types'
export { Tools, type Tool } from './tools'

export type SandboxProps = {
    title?: string
    codeLink?: string
}

export class Sandbox {
    root?: ReactDOM.Root

    constructor(private setup: SandboxFunction | Scenes, private config?: SandboxProps) {}

    mount(): this {
        if (!this.root) {
            const appElement = document.createElement('div')
            appElement.style.width = '100%'
            appElement.style.height = '100vh'
            appElement.style.overflow = 'scroll'
            document.body.appendChild(appElement)

            this.root = ReactDOM.createRoot(appElement)

            this.root.render(<App setup={this.setup} title={this.config?.title} codeLink={this.config?.codeLink} />)
        }

        return this
    }

    unmount(): void {
        if (this.root) {
            this.root.unmount()
            this.root = undefined
        }
    }
}
