import { Body } from '../../src/objects/Body'
import { Circle } from '../../src/shapes/Circle'
import { OverlapKeeper } from '../../src/utils/OverlapKeeper'

describe('Utils: OverlapKeeper', () => {
    test('construct', () => {
        new OverlapKeeper()
    })

    test('tick', () => {
        let keeper = new OverlapKeeper()

        const bodyA = new Body()
        const bodyB = new Body()
        const shapeA = new Circle({ radius: 1 })
        const shapeB = new Circle({ radius: 1 })

        keeper = new OverlapKeeper()
        keeper.recordPool.resize(0)
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        expect(keeper.recordPool.objects.length).toEqual(0)

        keeper.tick()

        expect(keeper.recordPool.objects.length).toEqual(0)

        keeper.tick()

        expect(keeper.recordPool.objects.length).toEqual(1)

        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        expect(keeper.recordPool.objects.length).toEqual(0)
    })

    test('getEndOverlaps', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const bodyC = new Body()
        const shapeA = new Circle({ radius: 1 })
        const shapeB = new Circle({ radius: 1 })
        const shapeC = new Circle({ radius: 1 })

        const keeper = new OverlapKeeper()
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        let result = keeper.getEndOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        result = keeper.getEndOverlaps()
        expect(result.length).toEqual(1)

        keeper.tick()

        result = keeper.getEndOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA)

        result = keeper.getEndOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        result = keeper.getEndOverlaps()
        expect(result.length).toEqual(3)
    })

    test('getNewOverlaps', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const bodyC = new Body()
        const shapeA = new Circle({ radius: 1 })
        const shapeB = new Circle({ radius: 1 })
        const shapeC = new Circle({ radius: 1 })
        const keeper = new OverlapKeeper()
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        let result = keeper.getNewOverlaps()
        expect(result.length).toEqual(1)
        expect(result[0].bodyA).toBe(bodyA)
        expect(result[0].bodyB).toBe(bodyB)
        expect(result[0].shapeA).toBe(shapeA)
        expect(result[0].shapeB).toBe(shapeB)

        keeper.tick()

        result = keeper.getNewOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        result = keeper.getNewOverlaps()
        expect(result.length).toEqual(0)

        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA)

        result = keeper.getNewOverlaps()
        expect(result.length).toEqual(3)
    })

    test('isNewOverlap', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const shapeA = new Circle({ radius: 1 })
        const shapeB = new Circle({ radius: 1 })
        const keeper = new OverlapKeeper()
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        let result = keeper.isNewOverlap(shapeA, shapeB)
        expect(result).toBe(true)

        keeper.tick()

        result = keeper.isNewOverlap(shapeA, shapeB)
        expect(result).toBe(false)

        keeper.tick()

        result = keeper.isNewOverlap(shapeA, shapeB)
        expect(result).toBe(false)
    })

    test('getNewBodyOverlaps', () => {
        const keeper = new OverlapKeeper()
        const bodyA = new Body()
        const bodyB = new Body()
        const bodyC = new Body()
        const shapeA = new Circle()
        const shapeB = new Circle()
        const shapeC = new Circle()
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        let result = keeper.getNewBodyOverlaps()
        expect(result.length).toEqual(2)

        keeper.tick()

        result = keeper.getNewBodyOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB)
        keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA)

        result = keeper.getNewBodyOverlaps()

        expect(result.length).toEqual(6)
    })

    test('getEndBodyOverlaps', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const shapeA = new Circle({ radius: 1 })
        const shapeB = new Circle({ radius: 1 })
        const keeper = new OverlapKeeper()
        keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB)

        let result = keeper.getEndBodyOverlaps()
        expect(result.length).toEqual(0)

        keeper.tick()

        result = keeper.getEndBodyOverlaps()
        expect(result.length).toEqual(2)
    })
})
