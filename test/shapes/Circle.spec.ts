import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Circle } from '../../src/shapes/Circle'

describe('Shapes: Circle', () => {
    test('construct', () => {
        const circle = new Circle({ radius: 2 })
        expect(circle.radius).toEqual(2)
    })

    test('computeAABB', () => {
        const aabb = new AABB(),
            offset = [2, 3]

        const c = new Circle({ radius: 1 })
        c.computeAABB(aabb, offset)
        expect(aabb.lowerBound[0]).toEqual(-1 + offset[0])
        expect(aabb.lowerBound[1]).toEqual(-1 + offset[1])
        expect(aabb.upperBound[0]).toEqual(1 + offset[0])
        expect(aabb.upperBound[1]).toEqual(1 + offset[1])
    })

    test('pointTest', () => {
        const shape = new Circle({ radius: 1 })
        expect(shape.pointTest([0, 0])).toBe(true)
        expect(shape.pointTest([1, 0])).toBe(true)
        expect(shape.pointTest([2, 0])).toBe(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [-10, 0],
            to: [10, 0],
        })

        const shape = new Circle({ radius: 0.5 })
        const result = new RaycastResult()
        shape.raycast(result, ray, [0, 0])
        expect(result.normal[0]).toEqual(-1)
        expect(result.normal[1]).toEqual(0)
    })
})
