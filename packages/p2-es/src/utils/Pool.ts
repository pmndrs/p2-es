export interface PoolOptions {
    size?: number
}

/**
 * Object pooling utility.
 */
export abstract class Pool<T> {
    objects: T[] = []

    constructor(options?: PoolOptions) {
        if (options?.size !== undefined) {
            this.resize(options.size)
        }
    }

    /**
     * Creates a new object in the pool
     */
    abstract create(): T

    /**
     * Destroys an object
     * @param object the object to destroy
     */
    abstract destroy(object: T): void

    /**
     * Resizes the pool
     * @param size
     * @return Self, for chaining
     */
    resize(size: number): Pool<T> {
        const objects = this.objects

        while (objects.length > size) {
            objects.pop()
        }

        while (objects.length < size) {
            objects.push(this.create())
        }

        return this
    }

    /**
     * Get an object from the pool or create a new instance.
     * @return an object from the pool
     */
    get(): T {
        const objects = this.objects
        return objects.length ? (objects.pop() as T) : this.create()
    }

    /**
     * Release an object back to the pool.
     * @param object
     * @return Self for chaining
     */
    release(object: T): Pool<T> {
        this.destroy(object)
        this.objects.push(object)
        return this
    }
}
