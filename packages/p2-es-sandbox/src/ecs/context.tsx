import { World } from 'arancini'
import { ReactAPI } from 'arancini/react'
import { Executor } from 'arancini/systems'
import React, { createContext, useContext } from 'react'
import { Entity } from './entity'

export type EcsContext = {
    world: World<Entity>
    executor: Executor<Entity>
    react: ReactAPI<Entity>
}

const ecsContext = createContext<EcsContext>(null!)

export const useECS = (): EcsContext => {
    return useContext(ecsContext)
}

export const EcsProvider = ({ children, ecs }: { children: React.ReactNode; ecs: EcsContext }) => {
    return <ecsContext.Provider value={ecs}>{children}</ecsContext.Provider>
}
