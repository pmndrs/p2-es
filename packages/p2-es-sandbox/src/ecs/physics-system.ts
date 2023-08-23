import { System } from 'arancini'
import { PhysicsWorldComponent, SettingsComponent } from './components'

export class PhysicsSystem extends System {
    settings = this.singleton(SettingsComponent)
    physicsWorld = this.singleton(PhysicsWorldComponent)

    onUpdate(delta: number): void {
        if (!this.settings || !this.physicsWorld) return

        const { physicsStepsPerSecond, maxSubSteps, paused } = this.settings

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        this.physicsWorld.step(1 / physicsStepsPerSecond, clampedDelta, maxSubSteps)
    }
}
