import { FederatedMouseEvent } from 'pixi.js'
import { create } from 'zustand'

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

export const usePointerStore = create<Pointer>(() => ({
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
}))
