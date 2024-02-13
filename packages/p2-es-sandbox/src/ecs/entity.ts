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

type PointerPositions = {
    stagePosition: [number, number]
    physicsPosition: [number, number]
}

type PointerTouches = {
    [key: string]: PointerPositions
}

export type Pointer = {
    primaryPointer: PointerPositions
    touches: PointerTouches

    pinching: boolean
    pinchInitialLength?: number
    pinchLength?: number
    pinchATouch?: string
    pinchBTouch?: string
    onPinchStart: Set<() => void>
    onPinchMove: Set<() => void>
    onPinchEnd: Set<() => void>

    onUp: Set<(e: FederatedMouseEvent) => void>
    onDown: Set<(e: FederatedMouseEvent) => void>
    onMove: Set<(e: FederatedMouseEvent) => void>
    onWheel: Set<(delta: number) => void>
}

export const createPointer = (): Pointer => {
    return {
        primaryPointer: {
            stagePosition: [0, 0],
            physicsPosition: [0, 0],
        },
        touches: {},
        pinching: false,
        onPinchStart: new Set(),
        onPinchMove: new Set(),
        onPinchEnd: new Set(),
        onUp: new Set(),
        onDown: new Set(),
        onMove: new Set(),
        onWheel: new Set(),
    }
}

export type Sprite = {
    graphics: Graphics
    drawnSleeping: boolean | null
    drawnLineColor: number | null
    drawnFillColor: number | null
    dirty: boolean
}

export const createSprite = () => {
    return {
        graphics: new Graphics(),
        drawnSleeping: null,
        drawnLineColor: null,
        drawnFillColor: null,
        dirty: false,
    }
}

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

export type Entity = {
    sandboxSettings?: SandboxSettings
    domElement?: HTMLElement
    physicsBody?: p2.Body
    physicsConstraint?: p2.Constraint
    physicsSpring?: p2.Spring
    physicsWorld?: p2.World
    pixi?: Pixi
    pointer?: Pointer
    sprite?: Sprite
}
