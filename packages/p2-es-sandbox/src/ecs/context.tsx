import { ReactAPI, createReactAPI } from 'arancini/react'
import React, { createContext, useContext } from 'react'
import { Entity } from './entity'

const ecsContext = createContext<ReturnType<typeof createReactAPI>>(null!)

export const useECS = (): ReactAPI<Entity> => {
    return useContext(ecsContext)
}

export const EcsProvider = ({ children, ecs }: { children: React.ReactNode; ecs: ReturnType<typeof createReactAPI> }) => {
    return <ecsContext.Provider value={ecs}>{children}</ecsContext.Provider>
}
