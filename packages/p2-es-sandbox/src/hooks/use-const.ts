import { useRef } from 'react'

export const useConst = <T>(fn: () => T): T => {
    const ref = useRef<T>()

    if (ref.current === undefined) {
        ref.current = fn()
    }

    return ref.current
}
