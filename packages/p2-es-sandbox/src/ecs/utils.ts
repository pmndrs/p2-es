import { useMemo } from 'react'
import { useECS } from './context'
import { Entity } from './entity'

export const useSingletonQuery = <C extends keyof Entity>(component: C) => {
    const {
        world,
        react: { useQuery },
    } = useECS()

    const singletonComponentQuery = useMemo(() => world.query((e) => e.has(component)), [world])

    const query = useQuery(singletonComponentQuery)

    return useMemo(() => query.first?.[component] ?? null, [query.version])
}
