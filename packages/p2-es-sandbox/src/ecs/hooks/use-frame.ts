import { useEffect, useRef } from 'react'
import { UpdateHandlerComponent } from '../classes'
import { ecs } from '../ecs'

const useMutableCallback = <T>(fn: T) => {
    const ref = useRef<T>(fn)
    useEffect(() => {
        ref.current = fn
    }, [fn])
    return ref
}

export const useFrame = (fn: (delta: number) => void, priority = 0) => {
    const ref = useMutableCallback(fn)

    useEffect(() => {
        const entity = ecs.world.create.entity()
        entity.add(UpdateHandlerComponent, ref, priority)

        return () => {
            entity.destroy()
        }
    }, [])
}
