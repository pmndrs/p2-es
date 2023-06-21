import { World } from 'arancini'
import { createECS } from 'arancini/react'
import {
    AppComponent,
    PhysicsBodyComponent,
    PhysicsConstraintComponent,
    PhysicsSpringComponent,
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    SettingsComponent,
    SpriteComponent,
    UpdateHandlerComponent,
} from './classes'

export const world = new World()

world.registerComponent(AppComponent)
world.registerComponent(PhysicsBodyComponent)
world.registerComponent(PhysicsSpringComponent)
world.registerComponent(PhysicsWorldComponent)
world.registerComponent(PhysicsConstraintComponent)
world.registerComponent(PixiComponent)
world.registerComponent(SettingsComponent)
world.registerComponent(SpriteComponent)
world.registerComponent(PointerComponent)
world.registerComponent(UpdateHandlerComponent)

world.init()

export const ecs = createECS(world)
