import { Broadphase } from '../../src/collision/Broadphase'
import { NaiveBroadphase } from '../../src/collision/NaiveBroadphase'

describe('Collison: NaiveBroadphase', () => {
    test('construct', () => {
        const broadphase = new NaiveBroadphase()
        expect(broadphase.type).toEqual(Broadphase.NAIVE)
    })
})

