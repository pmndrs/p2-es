import { Utils } from './../../src/utils/Utils'

describe('Utils', () => {
    test('appendArray', () => {
        const arrayA = [1, 2, 3]
        const arrayB = [4, 5, 6]
        Utils.appendArray(arrayA, arrayB)
        expect(arrayA).toEqual([1, 2, 3, 4, 5, 6])
        expect(arrayB).toEqual([4, 5, 6])
    })

    test('arrayRemove', () => {
        const array = [1, 2, 3]
        Utils.arrayRemove(array, 1)
        expect(array).toEqual([2, 3])
    })

    test('splice', () => {
        const array = [1, 2, 3]
        Utils.splice(array, 1)
        expect(array).toEqual([1, 3])
    })
})
