import { createECS } from 'arancini/react'
import React, { createContext, useContext } from 'react'

const ecsContext = createContext<ReturnType<typeof createECS>>(null!)

export const useECS = () => {
    return useContext(ecsContext)
}

export const EcsProvider = ({ children, ecs }: { children: React.ReactNode; ecs: ReturnType<typeof createECS> }) => {
    return <ecsContext.Provider value={ecs}>{children}</ecsContext.Provider>
}
