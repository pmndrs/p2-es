import { Component, ComponentClass } from 'arancini'
import { useMemo } from 'react'
import { ecs } from '../ecs'

export const useSingletonComponent = <T extends Component>(
    componentClass: ComponentClass<T>
) => {
    const query = ecs.useQuery([componentClass])

    return useMemo(() => {
        const entity = query.first
        if (!entity) {
            return null
        }

        const component = entity.find(componentClass)
        if (!component) {
            return null
        }

        return component
    }, [query])
}
