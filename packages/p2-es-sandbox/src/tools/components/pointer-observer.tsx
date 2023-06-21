import { vec2 } from 'p2-es'
import { FederatedEvent, FederatedMouseEvent } from 'pixi.js'
import { useEffect } from 'react'
import {
    PixiComponent,
    PointerComponent,
    ecs,
    useSingletonComponent,
} from '../../ecs'

const tmpVec2 = { x: 0, y: 0 }

export const PointerObserver = () => {
    const pixi = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixi) return

        const pointerEntity = ecs.world.create.entity()
        const pointer = pointerEntity.add(PointerComponent)

        const getPhysicsPosition = (stagePosition: {
            x: number
            y: number
        }): [number, number] => {
            const { x, y } = pixi.container.worldTransform.applyInverse(
                stagePosition,
                tmpVec2
            )
            return [x, y]
        }

        const updatePrimaryPointerPosition = (stagePosition: {
            x: number
            y: number
        }) => {
            pointer.primaryPointer.stagePosition[0] = stagePosition.x
            pointer.primaryPointer.stagePosition[1] = stagePosition.y

            const [physicsX, physicsY] = getPhysicsPosition(stagePosition)

            pointer.primaryPointer.physicsPosition[0] = physicsX
            pointer.primaryPointer.physicsPosition[1] = physicsY
        }

        const updateTouches = (e: FederatedMouseEvent) => {
            if (
                e.nativeEvent.type === 'touchmove' ||
                e.nativeEvent.type === 'touchstart'
            ) {
                const touchmove = e as FederatedEvent<PointerEvent>

                const stagePosition: [number, number] = [e.global.x, e.global.y]
                const physicsPosition: [number, number] = [
                    ...getPhysicsPosition(e.global),
                ]

                pointer.touches[touchmove.nativeEvent.pointerId] = {
                    stagePosition,
                    physicsPosition,
                }
            } else if (e.nativeEvent.type === 'touchend') {
                const touchend = e as FederatedEvent<PointerEvent>
                delete pointer.touches[touchend.nativeEvent.pointerId]
            }
        }

        const updatePinch = () => {
            const nTouches = Object.keys(pointer.touches).length

            if (!pointer.pinching && nTouches > 1) {
                pointer.pinching = true

                const touchKeys = Object.keys(pointer.touches)
                const [touchAKey, touchBKey] = touchKeys

                const touchA = pointer.touches[touchAKey]
                const touchB = pointer.touches[touchBKey]

                pointer.pinchATouch = touchAKey
                pointer.pinchBTouch = touchBKey

                pointer.pinchLength = vec2.distance(
                    touchA.physicsPosition,
                    touchB.physicsPosition
                )

                pointer.pinchInitialLength = pointer.pinchLength

                pointer.onPinchStart.forEach((fn) => fn())
            } else if (pointer.pinching) {
                if (
                    pointer.pinchATouch &&
                    pointer.pinchBTouch &&
                    pointer.touches[pointer.pinchATouch] &&
                    pointer.touches[pointer.pinchBTouch]
                ) {
                    const touchA = pointer.touches[pointer.pinchATouch]
                    const touchB = pointer.touches[pointer.pinchBTouch]

                    pointer.pinchLength = vec2.distance(
                        touchA.physicsPosition,
                        touchB.physicsPosition
                    )

                    pointer.onPinchMove.forEach((fn) => fn())
                } else {
                    pointer.pinching = false
                    pointer.pinchATouch = undefined
                    pointer.pinchBTouch = undefined
                    pointer.pinchLength = 0
                    pointer.pinchInitialLength = 0

                    pointer.onPinchEnd.forEach((fn) => fn())
                }
            }
        }

        const moveHandler = ((e: FederatedMouseEvent) => {
            updatePrimaryPointerPosition(e.global)

            updateTouches(e)

            updatePinch()

            pointer.onMove.forEach((handler) => handler(e))
        }) as never

        const downHandler = ((e: FederatedMouseEvent) => {
            updatePrimaryPointerPosition(e.global)

            updateTouches(e)

            updatePinch()

            pointer.onDown.forEach((handler) => handler(e))
        }) as never

        const upHandler = ((e: FederatedMouseEvent) => {
            updatePrimaryPointerPosition(e.global)

            updateTouches(e)

            updatePinch()

            pointer.onUp.forEach((handler) => handler(e))
        }) as never

        pixi.canvasElement.ontouchmove = (e: Event) => {
            e.preventDefault()
        }

        const wheelHandler = (event: WheelEvent) => {
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

            pointer.onWheel.forEach((handler) => handler(delta))
        }

        pixi.stage.addEventListener('pointermove', moveHandler, false)
        pixi.stage.addEventListener('pointerdown', downHandler, false)
        pixi.stage.addEventListener('pointerup', upHandler, false)
        pixi.canvasElement.addEventListener('wheel', wheelHandler, false)

        return () => {
            pixi.stage.removeEventListener('pointermove', moveHandler)
            pixi.stage.removeEventListener('pointerdown', downHandler)
            pixi.stage.removeEventListener('pointerup', upHandler)
            pixi.canvasElement.removeEventListener('wheel', wheelHandler, false)

            pointerEntity.destroy()
        }
    }, [pixi?.id])

    return null
}
