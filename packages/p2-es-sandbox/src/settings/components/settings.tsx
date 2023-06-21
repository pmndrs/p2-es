import { LevaStoreProvider, useCreateStore } from 'leva'
import React from 'react'
import { SandboxSettings } from '../../ecs'
import { Tool } from '../../tools'
import { SettingsInner } from './settings-inner'

export type SettingsProps = {
    tool: Tool
    setTool: (tool: Tool) => void

    scene: string
    scenes: string[]
    setScene: (scene: string) => void

    defaultSettings: SandboxSettings

    reset: () => void

    hidden?: boolean
}

export const Settings = (props: SettingsProps) => {
    const store = useCreateStore()

    return (
        <LevaStoreProvider store={store}>
            <SettingsInner {...props} />
        </LevaStoreProvider>
    )
}
