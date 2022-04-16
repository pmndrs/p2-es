import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'

/**
 * Overlap data container for the OverlapKeeper
 */
export class OverlapKeeperRecord {
    shapeA: Shape
    shapeB: Shape
    bodyA: Body
    bodyB: Body

    constructor(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape) {
        this.bodyA = bodyA
        this.shapeA = shapeA
        this.bodyB = bodyB
        this.shapeB = shapeB
    }

    /**
     * Set the data for the record
     * @param bodyA
     * @param shapeA
     * @param bodyB
     * @param shapeB
     */
    set(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void {
        OverlapKeeperRecord.call(this, bodyA, shapeA, bodyB, shapeB)
    }
}
