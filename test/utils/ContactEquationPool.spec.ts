import { ContactEquation } from '../../src/equations/ContactEquation'
import { Body } from '../../src/p2-es'
import { ContactEquationPool } from '../../src/utils/ContactEquationPool'

describe('Utils: ContactEquationPool', () => {
    test('construct', () => {
        new ContactEquationPool()
    })

    test('resize', () => {
        const pool = new ContactEquationPool()
        pool.resize(10)
        expect(pool.objects.length).toEqual(10)
    })

    test('getRelease', () => {
        const pool = new ContactEquationPool()
        expect(pool.objects.length).toEqual(0)
        const object = pool.get()

        const bodyA = new Body()
        const bodyB = new Body()
        object.bodyA = bodyA
        object.bodyB = bodyB

        // should create contact equations
        expect(object instanceof ContactEquation).toBe(true)

        // should not increase pool size when creating
        expect(pool.objects.length).toEqual(0)
        pool.release(object)

        // should clean released objects
        expect(object.bodyA).not.toBe(bodyA)
        expect(object.bodyB).not.toBe(bodyB)

        // should add released object to pool
        expect(pool.objects.length).toEqual(1)
        
        // should return pooled object
        const object2 = pool.get()
        expect(object).toBe(object2)
    })
})
