import { PhysicsWorldComponent, PixiComponent, STAGES, SettingsComponent, useFrame, useSingletonComponent } from '../../ecs'
import { canvasTheme } from '../../ui'

export const PhysicsAABBRenderer = () => {
    const pixi = useSingletonComponent(PixiComponent)
    const settings = useSingletonComponent(SettingsComponent)
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)

    useFrame(() => {
        if (!pixi || !settings || !physicsWorld) return

        const { drawAABBs } = settings
        const { graphics, container } = pixi

        if (drawAABBs) {
            graphics.aabb.clear()
            container.removeChild(graphics.aabb)
            container.addChild(graphics.aabb)

            const g = graphics.aabb
            g.lineStyle(canvasTheme.lineWidth, canvasTheme.aabb.lineColor, 1)

            for (let i = 0; i !== physicsWorld.bodies.length; i++) {
                const aabb = physicsWorld.bodies[i].getAABB()
                g.drawRect(
                    aabb.lowerBound[0],
                    aabb.lowerBound[1],
                    aabb.upperBound[0] - aabb.lowerBound[0],
                    aabb.upperBound[1] - aabb.lowerBound[1]
                )
            }
        } else {
            graphics.aabb.clear()
        }
    }, STAGES.RENDER_AABBS)

    return null
}
