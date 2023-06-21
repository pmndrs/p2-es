import { Component } from 'arancini'
import { FederatedMouseEvent } from 'pixi.js'

export type Positions = {
    stagePosition: [number, number]
    physicsPosition: [number, number]
}

export type Touches = {
    [key: string]: Positions
}

export class PointerComponent extends Component {
    primaryPointer: Positions = {
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
