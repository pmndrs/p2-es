import { System } from 'arancini'
import * as p2 from 'p2-es'
import { Entity } from './entity'

export class PhysicsSystem extends System<Entity> {
    settings = this.singleton('sandboxSettings')

    physicsWorld = this.query((e) => e.is('physicsWorld'))

    bodyEntities: Map<p2.Body, Entity> = new Map()

    springEntities: Map<p2.Spring, Entity> = new Map()

    onInit(): void {
        this.physicsWorld.onEntityAdded.add(({ physicsWorld }) => {
            // create entities for existing physics bodies and springs
            for (const body of physicsWorld.bodies) {
                this.createBodyEntity(body)
            }

            for (const spring of physicsWorld.springs) {
                this.createSpringEntity(spring)
            }

            // add physics body and spring entities on world events
            physicsWorld.on('addBody', this.addBodyHandler)
            physicsWorld.on('addSpring', this.addSpringHandler)
            physicsWorld.on('removeBody', this.removeBodyHandler)
            physicsWorld.on('removeSpring', this.removeSpringHandler)
        })

        this.physicsWorld.onEntityRemoved.add(({ physicsWorld }) => {
            physicsWorld.off('addBody', this.addBodyHandler)
            physicsWorld.off('addSpring', this.addSpringHandler)
            physicsWorld.off('removeBody', this.removeBodyHandler)
            physicsWorld.off('removeSpring', this.removeSpringHandler)
        })
    }

    onUpdate(delta: number): void {
        const physicsWorldEntity = this.physicsWorld.first

        if (!this.settings || !physicsWorldEntity) return

        const { physicsWorld } = physicsWorldEntity
        const { physicsStepsPerSecond, maxSubSteps, paused } = this.settings

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        physicsWorld.step(1 / physicsStepsPerSecond, clampedDelta, maxSubSteps)
    }

    createBodyEntity(body: p2.Body) {
        const entity = this.world.create({ physicsBody: body })
        this.bodyEntities.set(body, entity)
    }

    destroyBodyEntity(body: p2.Body) {
        const entity = this.bodyEntities.get(body)
        if (!entity) return

        this.world.destroy(entity)
        this.bodyEntities.delete(body)
    }

    createSpringEntity(spring: p2.Spring) {
        const entity = this.world.create({ physicsSpring: spring })
        this.springEntities.set(spring, entity)
    }

    destroySpringEntity(spring: p2.Spring) {
        const entity = this.springEntities.get(spring)!
        if (!entity) return

        this.world.destroy(entity)
        this.springEntities.delete(spring)
    }

    addBodyHandler = ({ body }: { body: p2.Body }) => this.createBodyEntity(body)

    removeBodyHandler = ({ body }: { body: p2.Body }) => this.destroyBodyEntity(body)

    addSpringHandler = ({ spring }: { spring: p2.Spring }) => this.createSpringEntity(spring)

    removeSpringHandler = ({ spring }: { spring: p2.Spring }) => this.destroySpringEntity(spring)
}
