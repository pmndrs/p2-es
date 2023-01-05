import type { AABB } from '../collision/AABB'
import * as vec2 from '../math/vec2'
import type { SharedShapeOptions } from './Shape'
import { Shape } from './Shape'

export class Particle extends Shape {
    constructor(options: SharedShapeOptions = {}) {
        super({
            ...options,
            type: Shape.PARTICLE,
        })

        this.updateBoundingRadius()
        this.updateArea()
    }

    computeMomentOfInertia(): number {
        return 0 // Can't rotate a particle
    }

    updateBoundingRadius(): void {
        this.boundingRadius = 0
    }

    computeAABB(out: AABB, position: [number, number]): void {
        vec2.copy(out.lowerBound, position)
        vec2.copy(out.upperBound, position)
    }
}
