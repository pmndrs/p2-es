import { Particle } from '../../src/shapes/Particle'

describe('Shapes: Particle', () => {
    test('construct', () => {
        new Particle()
    })

    test('pointTest', () => {
        const shape = new Particle()
        expect(shape.pointTest([0, 0])).toBe(false)
        expect(shape.pointTest([0, 1])).toBe(false)
    })
})
