import { LevaStoreProvider, useCreateStore } from 'leva'
import React from 'react'
import { SandboxSettings } from '../../ecs'
import { Tool } from '../../types'
import { ControlsInner } from './ControlsInner'

export type ControlsProps = {
    tool: Tool
    setTool: (tool: Tool) => void

    scene: string
    scenes: string[]
    setScene: (scene: string) => void

    defaultSettings: SandboxSettings

    reset: () => void

    hidden?: boolean
}

export const Controls = (props: ControlsProps) => {
    const store = useCreateStore()

    return (
        <LevaStoreProvider store={store}>
            <ControlsInner {...props} />
        </LevaStoreProvider>
    )
}
