import { Utils } from './Utils'

export class TupleDictionary<T> {
    /**
     * The data storage
     */
    data: { [id: string]: T } = {}

    /**
     * Keys that are currently used
     */
    keys: number[] = []

    /**
     * Generate a key given two integers
     * @param i
     * @param j
     * @return
     */
    getKey(id1: number, id2: number): number {
        id1 = id1 | 0
        id2 = id2 | 0

        if ((id1 | 0) === (id2 | 0)) {
            return -1
        }

        // valid for values < 2^16
        return ((id1 | 0) > (id2 | 0) ? (id1 << 16) | (id2 & 0xffff) : (id2 << 16) | (id1 & 0xffff)) | 0
    }

    /**
     * Gets data by a given key
     * @param key
     * @return
     */
    getByKey(key: number): T {
        key = key | 0
        return this.data[key]
    }

    /**
     * Gets a value
     * @param i
     * @param j
     * @return
     */
    get(i: number, j: number): T {
        return this.data[this.getKey(i, j)]
    }

    /**
     * Set a value.
     * @param i
     * @param j
     * @param value
     */
    set(i: number, j: number, value: T): number {
        if (!value) {
            throw new Error('No data!')
        }

        const key = this.getKey(i, j)

        // Check if key already exists
        if (!this.data[key]) {
            this.keys.push(key)
        }

        this.data[key] = value

        return key
    }

    /**
     * Remove all data.
     */
    reset(): void {
        const data = this.data,
            keys = this.keys

        let l = keys.length
        while (l--) {
            delete data[keys[l]]
        }

        keys.length = 0
    }

    /**
     * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
     * @method copy
     * @param {TupleDictionary} dict The TupleDictionary to copy into this one.
     */
    copy(dict: TupleDictionary<T>): void {
        this.reset()
        Utils.appendArray(this.keys, dict.keys)
        let l = dict.keys.length
        while (l--) {
            const key = dict.keys[l]
            this.data[key] = dict.data[key]
        }
    }
}
