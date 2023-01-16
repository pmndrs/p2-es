import { Component } from 'arancini'

export interface SandboxSettings {
    physicsStepsPerSecond: number
    maxSubSteps: number
    paused: boolean
    bodyIslandColors: boolean
    bodySleepOpacity: boolean
    debugPolygons: boolean
    drawContacts: boolean
    drawAABBs: boolean
    renderInterpolatedPositions: boolean
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
}

export interface Settings extends SandboxSettings {
    timeStep: number
}

export class SettingsComponent extends Component implements Settings {
    physicsStepsPerSecond!: Settings['physicsStepsPerSecond']

    timeStep!: Settings['timeStep']

    maxSubSteps!: Settings['maxSubSteps']

    paused!: Settings['paused']

    renderInterpolatedPositions!: Settings['renderInterpolatedPositions']

    bodyIslandColors!: Settings['bodyIslandColors']

    bodySleepOpacity!: Settings['bodySleepOpacity']

    debugPolygons!: Settings['debugPolygons']

    drawContacts!: Settings['drawContacts']

    drawAABBs!: Settings['drawAABBs']

    construct(settings: Settings) {
        this.physicsStepsPerSecond = settings.physicsStepsPerSecond
        this.timeStep = settings.timeStep
        this.maxSubSteps = settings.maxSubSteps
        this.paused = settings.paused
        this.renderInterpolatedPositions = settings.renderInterpolatedPositions
        this.bodyIslandColors = settings.bodyIslandColors
        this.bodySleepOpacity = settings.bodySleepOpacity
        this.debugPolygons = settings.debugPolygons
        this.drawContacts = settings.drawContacts
        this.drawAABBs = settings.drawAABBs
    }
}
