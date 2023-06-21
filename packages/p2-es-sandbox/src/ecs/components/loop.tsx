import { useEffect, useRef } from 'react'
import { UpdateHandlerComponent } from '../classes'
import { ecs } from '../ecs'

const VISIBILITY_CHANGE_EVENT = 'visibilitychange'
const VISIBLE_STATE = 'visible'

const usePageVisible = () => {
    const visible = useRef(true)

    useEffect(() => {
        const onPageVisibilityChange = () => {
            if (document.visibilityState === VISIBLE_STATE) {
                requestAnimationFrame(() => {
                    visible.current = true
                })
            } else {
                visible.current = false
            }
        }

        document.addEventListener(
            VISIBILITY_CHANGE_EVENT,
            onPageVisibilityChange
        )

        return () => {
            document.removeEventListener(
                VISIBILITY_CHANGE_EVENT,
                onPageVisibilityChange
            )
        }
    }, [])

    return visible
}

const loop = (fn: (delta: number) => void) => {
    let animationFrameRequest = 0
    let previousTime: undefined | number

    const animate = (time: number) => {
        const timeMs = time / 1000
        if (previousTime !== undefined) {
            const delta = timeMs - previousTime

            const clampedDelta = Math.min(delta, 1)

            fn(clampedDelta)
        }
        previousTime = timeMs
        animationFrameRequest = requestAnimationFrame(animate)
    }

    animationFrameRequest = requestAnimationFrame(animate)

    return () => {
        cancelAnimationFrame(animationFrameRequest)
    }
}

export const Loop = () => {
    const pageVisible = usePageVisible()

    useEffect(() => {
        const updateHandlersQuery = ecs.world.create.query([
            UpdateHandlerComponent,
        ])

        let sortedUpdateHandlers: UpdateHandlerComponent[] = []

        const sortHandlers = () => {
            sortedUpdateHandlers = updateHandlersQuery.entities
                .map((e) => e.get(UpdateHandlerComponent))
                .sort((a, b) => a.priority - b.priority)
        }

        updateHandlersQuery.onEntityAdded.add(() => sortHandlers())
        updateHandlersQuery.onEntityRemoved.add(() => sortHandlers())

        const stop = loop((delta) => {
            if (!pageVisible.current) return

            sortedUpdateHandlers.forEach((handler) => handler.fn.current(delta))
        })

        return () => {
            updateHandlersQuery.onEntityAdded.remove(sortHandlers)
            updateHandlersQuery.onEntityRemoved.remove(sortHandlers)
            updateHandlersQuery.destroy()
            stop()
        }
    }, [ecs])

    return null
}
