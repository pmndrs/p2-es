/**
 * Weighted Quick Union-Find with Path Compression. Based on https://github.com/juzerali/unionfind, but optimized for performance.
 */
export class UnionFind {
    id: number[] = []
    sz: number[] = []
    size: number
    count: number

    constructor(size: number) {
        this.size = size
        this.count = size
        this.resize(size)
    }

    resize(size: number) {
        this.count = this.size = size
        const sz = this.sz
        const id = this.id
        for (let i = 0; i < size; i++) {
            id[i] = i
            sz[i] = 1
        }
    }

    find(p: number): number {
        const id = this.id
        while (p !== id[p]) {
            id[p] = id[id[p]]
            p = id[p]
        }
        return p
    }

    /**
     * Combine elements in groups p and q into a single group. In other words connect the two groups.
     * @param p
     * @param q
     */
    union(p: number, q: number) {
        const i = this.find(p),
            j = this.find(q)

        if (i === j) {
            return
        }

        const sz = this.sz
        const id = this.id
        if (sz[i] < sz[j]) {
            id[i] = j
            sz[j] += sz[i]
        } else {
            id[j] = i
            sz[i] += sz[j]
        }

        this.count--
        return
    }
}
