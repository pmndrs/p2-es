import { QueryFn } from 'arancini'
import { useMemo } from 'react'
import { react, world } from './world'

export const useQuery = <Q extends QueryFn<any, any>>(queryFn: Q) => {
    const query = useMemo(() => world.query(queryFn), [world])

    return react.useQuery(query)
}
