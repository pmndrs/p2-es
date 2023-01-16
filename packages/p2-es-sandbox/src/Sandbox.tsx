import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import { SandboxFunction, Scenes } from './types'

export type SandboxProps = {
    title?: string
    codeLink?: string
}

export class Sandbox {
    root?: ReactDOM.Root

    // eslint-disable-next-line no-useless-constructor
    constructor(
        private setup: SandboxFunction | Scenes,
        private domElement: HTMLElement,
        private config?: SandboxProps
    ) {}

    mount(): this {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.domElement)

            this.root.render(
                <App
                    setup={this.setup}
                    title={this.config?.title}
                    codeLink={this.config?.codeLink}
                />
            )
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
