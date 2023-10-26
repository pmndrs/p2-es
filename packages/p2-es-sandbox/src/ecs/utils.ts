import { useEffect, useMemo, useRef } from 'react'
import { Entity } from './entity'
import { useECS } from './context'

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

        document.addEventListener(VISIBILITY_CHANGE_EVENT, onPageVisibilityChange)

        return () => {
            document.removeEventListener(VISIBILITY_CHANGE_EVENT, onPageVisibilityChange)
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

const useMutableCallback = <T>(fn: T) => {
    const ref = useRef<T>(fn)
    useEffect(() => {
        ref.current = fn
    }, [fn])
    return ref
}

export const useFrame = (fn: (delta: number) => void) => {
    const ref = useMutableCallback(fn)

    const pageVisible = usePageVisible()

    useEffect(() => {
        const stop = loop((delta) => {
            if (!pageVisible.current) return

            ref.current(delta)
        })

        return () => {
            stop()
        }
    }, [])
}

export const useSingletonComponent = <C extends keyof Entity>(component: C) => {
    const ecs = useECS()

    const query = ecs.useQuery((e) => e.has(component))

    return useMemo(() => {
        const entity = query.first
        if (!entity) {
            return null
        }

        return entity[component] ?? null
    }, [query.version])
}
