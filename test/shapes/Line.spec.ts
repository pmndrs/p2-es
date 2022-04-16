import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Line } from '../../src/shapes/Line'

describe('Shapes: Line', () => {
    test('construct', () => {
        let line = new Line({ length: 2 })
        expect(line.length).toEqual(2)

        line = new Line()
        expect(line.length).toEqual(1)
    })

    test('pointTest', () => {
        const shape = new Line()
        expect(shape.pointTest([0, 0])).toBe(false)
        expect(shape.pointTest([0, 1])).toBe(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [0, 0],
            to: [10, 0],
        })

        const shape = new Line({ length: 1 })
        const result = new RaycastResult()
        shape.raycast(result, ray, [1, 0], Math.PI / 2)
    })
})
