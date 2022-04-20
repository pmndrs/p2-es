import { TupleDictionary } from '../../src/utils/TupleDictionary'

describe('Utils: TupleDictionary', () => {
    test('construct', () => {
        new TupleDictionary()
    })

    test('getKey', () => {
        const dict = new TupleDictionary()
        const key = dict.getKey(1, 2)
        expect(typeof key === 'number')
    })

    test('get', () => {
        const dict = new TupleDictionary()
        const a = { id: 1 }
        const b = { id: 2 }
        const c = { id: 3 }
        dict.set(a.id, b.id, c)

        let obj = dict.get(a.id, b.id)
        expect(obj).toEqual(c)

        obj = dict.get(b.id, a.id)
        expect(obj).toEqual(c)

        obj = dict.get(3, 4)
        expect(obj).toEqual(undefined)
    })
		
    test('set', () => {
        const dict = new TupleDictionary()

        dict.set(1, 2, 3)
        const key = dict.getKey(1, 2)
        expect(dict.keys).toEqual([key])
        expect(dict.data[key]).toEqual(3)

        dict.set(2, 1, 3)
        expect(dict.keys).toEqual([key])

        dict.set(2, 1, 3)
        expect(dict.keys).toEqual([key])
    })
		
    test('reset', () => {
        const dict = new TupleDictionary()

        dict.set(1, 2, 1)
        dict.set(3, 4, 1)

        dict.reset()
        expect(dict.keys.length).toEqual(0)
    })
		
    test('copy', () => {
        const dict1 = new TupleDictionary()
        const dict2 = new TupleDictionary()

        dict1.set(1, 2, 1)
        dict1.set(2, 3, 2)
        dict1.set(4, 3, 3)

        dict2.copy(dict1)

        expect(dict1).toEqual(dict2)
    })
})
