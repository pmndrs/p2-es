import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Plane } from '../../src/shapes/Plane'

describe('Shapes: Plane', () => {
    test('construct', () => {
        new Plane()
    })

    test('computeAABB', () => {
        const plane = new Plane()
        const aabb = new AABB()
        plane.computeAABB(aabb, [0, 0], 0)
    })

    test('computeMomentOfIntertia', () => {
        expect(new Plane().computeMomentOfInertia()).toEqual(0)
    })

    test('updateBoundingRadius', () => {
        const plane = new Plane()
        plane.updateBoundingRadius()
        expect(plane.boundingRadius > 0).toBe(true)
    })

    test('pointTest', () => {
        const shape = new Plane()
        expect(shape.pointTest([0, -1])).toBe(true)
        expect(shape.pointTest([0, 0])).toBe(true)
        expect(shape.pointTest([0, 1])).toBe(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [0, 0],
            to: [10, 0],
        })

        const shape = new Plane()
        const result = new RaycastResult()
        shape.raycast(result, ray, [1, 0], Math.PI / 2)
    })
})
