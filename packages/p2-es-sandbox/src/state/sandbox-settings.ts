import { create } from 'zustand'

export type SandboxSettings = {
    physicsStepsPerSecond: number
    maxSubSteps: number
    paused: boolean
    bodyIslandColors: boolean
    bodySleepOpacity: boolean
    debugPolygons: boolean
    drawContacts: boolean
    drawAABBs: boolean
    renderInterpolatedPositions: boolean
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
    enablePanning?: boolean
    enableZooming?: boolean
}

export const defaultSandboxSettings: SandboxSettings = {
    physicsStepsPerSecond: 60,
    maxSubSteps: 3,
    paused: false,
    bodyIslandColors: false,
    bodySleepOpacity: false,
    debugPolygons: false,
    drawContacts: false,
    drawAABBs: false,
    renderInterpolatedPositions: true,
    enablePanning: true,
    enableZooming: true,
}

export type SandboxSettingsStore = SandboxSettings & {
    setSandboxSettings: (settings: Partial<SandboxSettings> | ((current: SandboxSettings) => SandboxSettings)) => void
}

export const useSandboxSettings = create<SandboxSettingsStore>((set) => ({
    ...defaultSandboxSettings,
    setSandboxSettings: set,
}))
