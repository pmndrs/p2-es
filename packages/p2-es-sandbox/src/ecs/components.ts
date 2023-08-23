import { Component } from 'arancini'
import * as p2 from 'p2-es'
import { Application, Container, FederatedMouseEvent, Graphics } from 'pixi.js'

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
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
    enablePanning?: boolean
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
}

export const SettingsComponent = Component.object<SandboxSettings>('settings')

export const DomElementComponent = Component.object<HTMLDivElement>('dom element')

export const PhysicsBodyComponent = Component.object<p2.Body>('physics body')

export const PhysicsConstraintComponent = Component.object<p2.Constraint>('physics constraint')

export const PhysicsSpringComponent = Component.object<p2.Spring>('physics spring')

export const PhysicsWorldComponent = Component.object<p2.World>('physics world')

export type Pixi = {
    canvasElement: HTMLCanvasElement
    application: Application
    stage: Container
    container: Container
    background: Graphics
    graphics: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
        drawShape: Graphics
    }
    onResize: () => void
}

export const PixiComponent = Component.object<Pixi>('pixi')

type PointerPositions = {
    stagePosition: [number, number]
    physicsPosition: [number, number]
}

type Touches = {
    [key: string]: PointerPositions
}

export class PointerComponent extends Component {
    id = 0

    primaryPointer: PointerPositions = {
        stagePosition: [0, 0],
        physicsPosition: [0, 0],
    }

    touches: Touches = {}

    pinching = false

    pinchInitialLength?: number

    pinchLength?: number

    pinchATouch?: string

    pinchBTouch?: string

    onPinchStart = new Set<() => void>()

    onPinchMove = new Set<() => void>()

    onPinchEnd = new Set<() => void>()

    onUp = new Set<(e: FederatedMouseEvent) => void>()

    onDown = new Set<(e: FederatedMouseEvent) => void>()

    onMove = new Set<(e: FederatedMouseEvent) => void>()

    onWheel = new Set<(delta: number) => void>()

    construct() {
        this.id++

        this.primaryPointer.stagePosition[0] = 0
        this.primaryPointer.stagePosition[1] = 0

        this.primaryPointer.physicsPosition[0] = 0
        this.primaryPointer.physicsPosition[1] = 0

        this.touches = {}

        this.onPinchStart.clear()
        this.onPinchMove.clear()
        this.onPinchEnd.clear()
        this.onUp.clear()
        this.onDown.clear()
        this.onMove.clear()
    }
}

export class SpriteComponent extends Component {
    graphics!: Graphics

    drawnSleeping!: boolean | null

    drawnLineColor!: number | null

    drawnFillColor!: number | null

    dirty!: boolean

    construct() {
        this.graphics = new Graphics()
        this.drawnSleeping = null
        this.drawnLineColor = null
        this.drawnFillColor = null
        this.dirty = false
    }

    onDestroy(): void {
        this.graphics.destroy()
    }
}
