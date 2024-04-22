import { World } from 'arancini'
import { createReactAPI } from 'arancini/react'
import { Entity } from './entity'

export const world = new World<Entity>()
export const react = createReactAPI(world)
