import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Capsule } from '../../src/shapes/Capsule'

describe('Shapes: Capsule', () => {
    test('construct', () => {
        const capsule = new Capsule({ length: 2, radius: 3 })
        expect(capsule.length).toEqual(2)
        expect(capsule.radius).toEqual(3)
    })

    test('pointTest', () => {
        const shape = new Capsule({
            radius: 1,
            length: 2,
        })
        expect(shape.pointTest([0, 0])).toBe(true)
        expect(shape.pointTest([2, 0])).toBe(true)
        expect(shape.pointTest([0, 1])).toBe(true)
        expect(shape.pointTest([0, 2])).toBe(false)
        expect(shape.pointTest([2, 1])).toBe(false)
        expect(shape.pointTest([3, 0])).toBe(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [0, 0],
            to: [10, 0],
        })

        const capsule = new Capsule({ length: 1, radius: 0.5 })
        const result = new RaycastResult()
        capsule.raycast(result, ray, [1, 0], Math.PI / 2)
    })
})
