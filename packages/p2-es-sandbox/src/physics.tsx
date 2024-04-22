import * as p2 from 'p2-es'
import { useEffect } from 'react'
import { Entity, world } from './ecs'
import { useConst } from './hooks/use-const'
import { useFrame } from './hooks/use-frame'
import { usePhysicsWorldStore, useSandboxSettings } from './state'

export const Physics = () => {
    const { world: physics } = usePhysicsWorldStore()
    const settings = useSandboxSettings()

    const bodyEntities = useConst(() => new Map<p2.Body, Entity>())
    const springEntities = useConst(() => new Map<p2.Spring, Entity>())

    const createBodyEntity = (body: p2.Body) => {
        const entity = world.create({ physicsBody: body })
        bodyEntities.set(body, entity)
    }

    const destroyBodyEntity = (body: p2.Body) => {
        const entity = bodyEntities.get(body)
        if (!entity) return

        world.destroy(entity)
        bodyEntities.delete(body)
    }

    const createSpringEntity = (spring: p2.Spring) => {
        const entity = world.create({ physicsSpring: spring })
        springEntities.set(spring, entity)
    }

    const destroySpringEntity = (spring: p2.Spring) => {
        const entity = springEntities.get(spring)!
        if (!entity) return

        world.destroy(entity)
        springEntities.delete(spring)
    }

    const addBodyHandler = ({ body }: { body: p2.Body }) => createBodyEntity(body)

    const removeBodyHandler = ({ body }: { body: p2.Body }) => destroyBodyEntity(body)

    const addSpringHandler = ({ spring }: { spring: p2.Spring }) => createSpringEntity(spring)

    const removeSpringHandler = ({ spring }: { spring: p2.Spring }) => destroySpringEntity(spring)

    useEffect(() => {
        if (!physics) return

        // create entities for existing physics bodies and springs
        for (const body of physics.bodies) {
            createBodyEntity(body)
        }

        for (const spring of physics.springs) {
            createSpringEntity(spring)
        }

        // add physics body and spring entities on world events
        physics.on('addBody', addBodyHandler)
        physics.on('addSpring', addSpringHandler)
        physics.on('removeBody', removeBodyHandler)
        physics.on('removeSpring', removeSpringHandler)

        return () => {
            physics.off('addBody', addBodyHandler)
            physics.off('addSpring', addSpringHandler)
            physics.off('removeBody', removeBodyHandler)
            physics.off('removeSpring', removeSpringHandler)
        }
    }, [physics])

    useFrame((delta) => {
        if (!physics) return

        const { physicsStepsPerSecond, maxSubSteps, paused } = settings

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        physics.step(1 / physicsStepsPerSecond, clampedDelta, maxSubSteps)
    })

    return null
}
