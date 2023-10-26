import { System } from 'arancini'
import { Entity } from './entity'

export class PhysicsSystem extends System<Entity> {
    settings = this.singleton('sandboxSettings')
    physicsWorld = this.singleton('physicsWorld')

    onUpdate(delta: number): void {
        if (!this.settings || !this.physicsWorld) return

        const { physicsStepsPerSecond, maxSubSteps, paused } = this.settings

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        this.physicsWorld.step(1 / physicsStepsPerSecond, clampedDelta, maxSubSteps)
    }
}
