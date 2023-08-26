import { System } from 'arancini'
import * as p2 from 'p2-es'
import { FederatedEvent, FederatedMouseEvent } from 'pixi.js'
import { PixiComponent, PointerComponent } from './components'

const tmpVec2 = { x: 0, y: 0 }

export class PointerSystem extends System {
    pixi = this.singleton(PixiComponent)!

    pointer = this.singleton(PointerComponent)!

    onInit() {
        this.pixi.canvasElement.ontouchmove = (e: Event) => {
            e.preventDefault()
        }

        this.pixi.stage.addEventListener('pointermove', this.moveHandler, false)
        this.pixi.stage.addEventListener('pointerdown', this.downHandler, false)
        this.pixi.stage.addEventListener('pointerup', this.upHandler, false)
        this.pixi.canvasElement.addEventListener('wheel', this.wheelHandler, false)
    }

    onDestroy(): void {
        this.pixi.stage.removeEventListener('pointermove', this.moveHandler)
        this.pixi.stage.removeEventListener('pointerdown', this.downHandler)
        this.pixi.stage.removeEventListener('pointerup', this.upHandler)
        this.pixi.canvasElement.removeEventListener('wheel', this.wheelHandler)
    }

    getPhysicsPosition(stagePosition: { x: number; y: number }): [number, number] {
        const { x, y } = this.pixi.container.worldTransform.applyInverse(stagePosition, tmpVec2)
        return [x, y]
    }

    updatePrimaryPointerPosition(stagePosition: { x: number; y: number }) {
        this.pointer.primaryPointer.stagePosition[0] = stagePosition.x
        this.pointer.primaryPointer.stagePosition[1] = stagePosition.y

        const [physicsX, physicsY] = this.getPhysicsPosition(stagePosition)

        this.pointer.primaryPointer.physicsPosition[0] = physicsX
        this.pointer.primaryPointer.physicsPosition[1] = physicsY
    }

    updateTouches(e: FederatedMouseEvent) {
        if (e.nativeEvent.type === 'touchmove' || e.nativeEvent.type === 'touchstart') {
            const touchmove = e as FederatedEvent<PointerEvent>

            const stagePosition: [number, number] = [e.global.x, e.global.y]
            const physicsPosition: [number, number] = [...this.getPhysicsPosition(e.global)]

            this.pointer.touches[touchmove.nativeEvent.pointerId] = {
                stagePosition,
                physicsPosition,
            }
        } else if (e.nativeEvent.type === 'touchend') {
            const touchend = e as FederatedEvent<PointerEvent>
            delete this.pointer.touches[touchend.nativeEvent.pointerId]
        }
    }

    updatePinch() {
        const nTouches = Object.keys(this.pointer.touches).length

        if (!this.pointer.pinching && nTouches > 1) {
            this.pointer.pinching = true

            const touchKeys = Object.keys(this.pointer.touches)
            const [touchAKey, touchBKey] = touchKeys

            const touchA = this.pointer.touches[touchAKey]
            const touchB = this.pointer.touches[touchBKey]

            this.pointer.pinchATouch = touchAKey
            this.pointer.pinchBTouch = touchBKey

            this.pointer.pinchLength = p2.vec2.distance(touchA.physicsPosition, touchB.physicsPosition)

            this.pointer.pinchInitialLength = this.pointer.pinchLength

            this.pointer.onPinchStart.forEach((fn) => fn())
        } else if (this.pointer.pinching) {
            if (
                this.pointer.pinchATouch &&
                this.pointer.pinchBTouch &&
                this.pointer.touches[this.pointer.pinchATouch] &&
                this.pointer.touches[this.pointer.pinchBTouch]
            ) {
                const touchA = this.pointer.touches[this.pointer.pinchATouch]
                const touchB = this.pointer.touches[this.pointer.pinchBTouch]

                this.pointer.pinchLength = p2.vec2.distance(touchA.physicsPosition, touchB.physicsPosition)

                this.pointer.onPinchMove.forEach((fn) => fn())
            } else {
                this.pointer.pinching = false
                this.pointer.pinchATouch = undefined
                this.pointer.pinchBTouch = undefined
                this.pointer.pinchLength = 0
                this.pointer.pinchInitialLength = 0

                this.pointer.onPinchEnd.forEach((fn) => fn())
            }
        }
    }

    moveHandler = (e: FederatedMouseEvent) => {
        this.updatePrimaryPointerPosition(e.global)

        this.updateTouches(e)

        this.updatePinch()

        this.pointer.onMove.forEach((handler) => handler(e))
    }

    downHandler = (e: FederatedMouseEvent) => {
        this.updatePrimaryPointerPosition(e.global)

        this.updateTouches(e)

        this.updatePinch()

        this.pointer.onDown.forEach((handler) => handler(e))
    }

    upHandler = (e: FederatedMouseEvent) => {
        this.updatePrimaryPointerPosition(e.global)

        this.updateTouches(e)

        this.updatePinch()

        this.pointer.onUp.forEach((handler) => handler(e))
    }

    wheelHandler = (event: WheelEvent) => {
        const n = 225
        const n1 = n - 1

        let delta = event.deltaY

        // noramlize delta
        delta = -delta / 1.35

        // quadratic scale if |d| > 1
        if (delta < 1) {
            delta = delta < -1 ? (-(delta ** 2) - n1) / n : delta
        } else {
            delta = (delta ** 2 + n1) / n
        }

        // delta should not be greater than 2
        delta = Math.min(Math.max(delta / 2, -1), 1)

        this.pointer.onWheel.forEach((handler) => handler(delta))
    }
}
