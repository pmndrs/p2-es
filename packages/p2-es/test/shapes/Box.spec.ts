import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Box } from '../../src/shapes/Box'

describe('Shapes: Box', () => {
    test('construct', () => {
        let rect = new Box()
        expect(rect.width).toEqual(1)
        expect(rect.height).toEqual(1)
        rect = new Box({ width: 2, height: 3 })
    })

    test('computeAABB', () => {
        const aabb = new AABB(),
            offset = [2, 3]

        const c = new Box({ width: 1, height: 2 })
        c.computeAABB(aabb, offset, Math.PI / 2)
        expect(aabb.lowerBound[0]).toEqual(-1 + offset[0])
        expect(aabb.lowerBound[1]).toEqual(-0.5 + offset[1])
        expect(aabb.upperBound[0]).toEqual(1 + offset[0])
        expect(aabb.upperBound[1]).toEqual(0.5 + offset[1])
    })

    test('pointTest', () => {
        const shape = new Box({
            width: 2,
            height: 1,
        })
        expect(shape.pointTest([0, 0])).toBe(true)
        expect(shape.pointTest([1, 0])).toBe(true)
        expect(shape.pointTest([2, 0])).toBe(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [0, 0],
            to: [10, 0],
        })

        const shape = new Box()
        const result = new RaycastResult()
        shape.raycast(result, ray, [1, 0], Math.PI / 2)
    })
})
