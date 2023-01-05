import * as vec2 from '../../src/math/vec2'

describe('vec2', () => {
    test('centroid', () => {
        const a = [0, 0],
            b = [1, 0],
            c = [2, 3],
            out = [0, 0]
        vec2.centroid(out, a, b, c)
        expect(out).toEqual([1, 1])
    })

    test('crossLength', () => {
        const a = [1, 0],
            b = [0, 1]
        expect(vec2.crossLength(a, b)).toEqual(1)
    })

    test('rotate', () => {
        const a = [1, 0],
            out = [0, 0]
        vec2.rotate(out, a, Math.PI)
        expect(vec2.distance(out, [-1, 0]) < 0.001).toBeTruthy
    })
})
