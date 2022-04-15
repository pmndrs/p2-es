import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'
import * as vec2 from '../../src/math/vec2'

describe('AABB', () => {
    test('construct', () => {
        const aabb = new AABB({
            lowerBound: [-1, -2],
            upperBound: [1, 2],
        })
        expect(aabb.lowerBound[0]).toEqual(-1)
        expect(aabb.lowerBound[1]).toEqual(-2)
        expect(aabb.upperBound[0]).toEqual(1)
        expect(aabb.upperBound[1]).toEqual(2)
    })

    test('copy', () => {
        const aabb = new AABB({
            lowerBound: [-1, -2],
            upperBound: [1, 2],
        })
        const aabb2 = new AABB()
        aabb2.copy(aabb)
        expect(aabb2.lowerBound[0]).toEqual(-1)
        expect(aabb2.lowerBound[1]).toEqual(-2)
        expect(aabb2.upperBound[0]).toEqual(1)
        expect(aabb2.upperBound[1]).toEqual(2)
    })

    test('overlaps', () => {
        const a = new AABB()
        const b = new AABB()

        // Same aabb
        vec2.set(a.lowerBound, -1, -1)
        vec2.set(a.upperBound, 1, 1)
        vec2.set(b.lowerBound, -1, -1)
        vec2.set(b.upperBound, 1, 1)
        // should detect overlap of self
        expect(a.overlaps(b)).toBe(true)

        // Corner overlaps
        vec2.set(b.lowerBound, 1, 1)
        vec2.set(b.upperBound, 2, 2)
        // should detect corner overlap
        expect(a.overlaps(b)).toBe(true)

        // Separate
        vec2.set(b.lowerBound, 1.1, 1.1)
        // should detect separated
        expect(a.overlaps(b)).toBe(false)

        // fully inside
        vec2.set(b.lowerBound, -0.5, -0.5)
        vec2.set(b.upperBound, 0.5, 0.5)
        // should detect if aabb is fully inside other aabb
        expect(a.overlaps(b)).toBe(true)
        vec2.set(b.lowerBound, -1.5, -1.5)
        vec2.set(b.upperBound, 1.5, 1.5)
        // should detect if aabb is fully inside other aabb
        expect(a.overlaps(b)).toBe(true)

        // Translated
        vec2.set(b.lowerBound, -3, -0.5)
        vec2.set(b.upperBound, -2, 0.5)
        expect(!a.overlaps(b)).toBe(true)
    })

    test('containsPoint', () => {
        const aabb = new AABB({
            lowerBound: [-1, -1],
            upperBound: [1, 1],
        })
        expect(aabb.containsPoint([0, 0])).toBe(true)
        expect(aabb.containsPoint([1, 1])).toBe(true)
        expect(aabb.containsPoint([-1, -1])).toBe(true)
        expect(aabb.containsPoint([2, 2])).toBe(false)
    })

    test('overlapsRay', () => {
        const aabb = new AABB({
            upperBound: [1, 1],
            lowerBound: [-1, -1],
        })
        const ray = new Ray({
            from: [-2, 0],
            to: [0, 0],
        })
        const result = aabb.overlapsRay(ray)
        expect(result).toEqual(0.5)
    })

    test('setFromPoints', () => {
        const a = new AABB()
        const points = [
            [-1, -1],
            [1, 1],
            [0, 0],
        ]
        const position = [1, 1]
        const angle = 0
        a.setFromPoints(points, position, angle)

        expect(a.lowerBound[0]).toEqual(0)
        expect(a.lowerBound[1]).toEqual(0)
        expect(a.upperBound[0]).toEqual(2)
        expect(a.upperBound[1]).toEqual(2)

        // One point
        a.setFromPoints([[1, 2]], [0, 0], 0)
        expect(a.lowerBound[0]).toEqual(1)
        expect(a.lowerBound[1]).toEqual(2)
        expect(a.upperBound[0]).toEqual(1)
        expect(a.upperBound[1]).toEqual(2)

        // Rotated 45 degrees
        a.setFromPoints(points, [0, 0], Math.PI / 4)
        expect(Math.abs(a.lowerBound[0]) < 0.01)
        expect(Math.abs(a.upperBound[0]) < 0.01)
    })
})
