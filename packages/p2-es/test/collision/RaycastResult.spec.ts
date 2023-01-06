import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { Body } from '../../src/objects/Body'
import { Plane } from '../../src/shapes/Plane'

describe('Collision: RaycastResult', () => {
    test('construct', () => {
        new RaycastResult()
    })

    test('reset', () => {
        const result = new RaycastResult()
        const result2 = new RaycastResult()
        result.normal[0] = 1
        result.fraction = 1
        result.shape = new Plane()
        result.body = new Body()
        result.faceIndex = 123
        result.reset()
        expect(result).toEqual(result2)
    })

    test('getHitDistance', () => {
        const result = new RaycastResult()
        const plane = new Plane()
        const ray = new Ray({
            from: [0, 2],
            to: [0, -2],
        })
        plane.raycast(result, ray, [0, 0], 0)
        expect(result.getHitDistance(ray)).toEqual(2)
    })

    test('hasHit', () => {
        const result = new RaycastResult()
        expect(result.hasHit()).toBe(false)
    })

    test('getHitPoint', () => {
        const result = new RaycastResult()
        const plane = new Plane()
        const ray = new Ray({
            from: [0, 2],
            to: [0, -2],
        })
        plane.raycast(result, ray, [0, 0], 0)
        const point = [1, 2]
        result.getHitPoint(point, ray)
        expect(point).toEqual([0, 0])
    })

    test('stop', () => {
        const result = new RaycastResult()
        result.stop()
        expect(result.isStopped).toBe(true)
    })
})
