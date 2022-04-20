import { UnionFind } from '../../src/world/UnionFind'

describe('World: UnionFind', () => {
    test('construct', () => {
        const uf = new UnionFind(10)

        expect(uf.size).toEqual(10)
        expect(uf.count).toEqual(10)
    })

    test('resize', () => {
        const uf = new UnionFind(10)

        expect(uf.size).toEqual(10)

        uf.resize(20)
        expect(uf.size).toEqual(20)
        expect(uf.count).toEqual(20)
    })

    test('union', () => {
        const uf = new UnionFind(10)

        expect(uf.size).toEqual(10)

        uf.union(0, 1)
        uf.union(1, 2)
        uf.union(2, 3)

        uf.union(4, 5)
        uf.union(5, 6)
        uf.union(6, 7)

        uf.union(8, 9)

        expect(uf.find(0)).toEqual(uf.find(3))
        expect(uf.find(4)).toEqual(uf.find(7))
        expect(uf.find(8)).toEqual(uf.find(9))
        expect(uf.find(0)).not.toEqual(uf.find(9))
    })
})
