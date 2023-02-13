import { createECS } from '@arancini/react'
import { World } from 'arancini'
import { PhysicsBodyComponent } from './components/PhysicsBodyComponent'
import { PhysicsConstraintComponent } from './components/PhysicsConstraintComponent'
import { PhysicsSpringComponent } from './components/PhysicsSpringComponent'
import { AppComponent } from './components/singletons/AppComponent'
import { PhysicsWorldComponent } from './components/singletons/PhysicsWorldComponent'
import { PixiComponent } from './components/singletons/PixiComponent'
import { PointerComponent } from './components/singletons/PointerComponent'
import { SettingsComponent } from './components/singletons/SettingsComponent'
import { SpriteComponent } from './components/SpriteComponent'
import { UpdateHandlerComponent } from './components/UpdateHandlerComponent'

const world = new World()

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

const ecs = createECS(world)

export * from './components/PhysicsBodyComponent'
export * from './components/PhysicsConstraintComponent'
export * from './components/PhysicsSpringComponent'
export * from './components/singletons/AppComponent'
export * from './components/singletons/PhysicsWorldComponent'
export * from './components/singletons/PixiComponent'
export * from './components/singletons/PointerComponent'
export * from './components/singletons/SettingsComponent'
export * from './components/SpriteComponent'
export * from './components/UpdateHandlerComponent'
export { ecs, world }
