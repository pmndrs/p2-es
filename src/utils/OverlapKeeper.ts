import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'
import type { OverlapKeeperRecord } from './OverlapKeeperRecord'
import { OverlapKeeperRecordPool } from './OverlapKeeperRecordPool'
import { TupleDictionary } from './TupleDictionary'

export class OverlapKeeper {
    recordPool: OverlapKeeperRecordPool

    overlappingShapesLastState: TupleDictionary<OverlapKeeperRecord>
    overlappingShapesCurrentState: TupleDictionary<OverlapKeeperRecord>
    tmpDict: TupleDictionary<OverlapKeeperRecord>
    tmpArray1: OverlapKeeperRecord[]

    constructor() {
        this.overlappingShapesLastState = new TupleDictionary()
        this.overlappingShapesCurrentState = new TupleDictionary()
        this.recordPool = new OverlapKeeperRecordPool({ size: 16 })
        this.tmpDict = new TupleDictionary()
        this.tmpArray1 = []
    }

    /**
     * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
     */
    tick(): void {
        const last = this.overlappingShapesLastState
        const current = this.overlappingShapesCurrentState

        // Save old objects into pool
        let l = last.keys.length
        while (l--) {
            const key = last.keys[l]
            const lastObject = last.getByKey(key)
            if (lastObject) {
                // The record is only used in the "last" dict, and will be removed. We might as well pool it.
                this.recordPool.release(lastObject)
            }
        }

        // Clear last object
        last.reset()

        // Transfer from new object to old
        last.copy(current)

        // Clear current object
        current.reset()
    }

    /**
     * Checks if two bodies are currently overlapping.
     * @param bodyA
     * @param bodyB
     * @return if two bodies are currently overlapping
     */
    bodiesAreOverlapping(bodyA: Body, bodyB: Body): boolean {
        const current = this.overlappingShapesCurrentState
        let l = current.keys.length
        while (l--) {
            const key = current.keys[l]
            const data = current.data[key]
            if ((data.bodyA === bodyA && data.bodyB === bodyB) || (data.bodyA === bodyB && data.bodyB === bodyA)) {
                return true
            }
        }
        return false
    }

    setOverlapping(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void {
        const current = this.overlappingShapesCurrentState

        // Store current contact state
        if (!current.get(shapeA.id, shapeB.id)) {
            const data = this.recordPool.get()
            data.set(bodyA, shapeA, bodyB, shapeB)
            current.set(shapeA.id, shapeB.id, data)
        }
    }

    getNewOverlaps(result?: OverlapKeeperRecord[]) {
        return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result)
    }

    getEndOverlaps(result?: OverlapKeeperRecord[]) {
        return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result)
    }

    getDiff(
        dictA: TupleDictionary<OverlapKeeperRecord>,
        dictB: TupleDictionary<OverlapKeeperRecord>,
        result: OverlapKeeperRecord[] = []
    ) {
        const last = dictA
        const current = dictB

        result.length = 0

        let l = current.keys.length
        while (l--) {
            const key = current.keys[l]
            const data = current.data[key]

            if (!data) {
                throw new Error('Key ' + key + ' had no data!')
            }

            const lastData = last.data[key]
            if (!lastData) {
                // Not overlapping in last state, but in current.
                result.push(data)
            }
        }

        return result
    }

    isNewOverlap(shapeA: Shape, shapeB: Shape): boolean {
        const idA = shapeA.id | 0,
            idB = shapeB.id | 0
        const last = this.overlappingShapesLastState
        const current = this.overlappingShapesCurrentState
        // Not in last but in new
        return !last.get(idA, idB) && !!current.get(idA, idB)
    }

    getNewBodyOverlaps(result?: Body[]): Body[] {
        this.tmpArray1.length = 0
        const overlaps = this.getNewOverlaps(this.tmpArray1)
        return this.getBodyDiff(overlaps, result)
    }

    getEndBodyOverlaps(result?: Body[]): Body[] {
        this.tmpArray1.length = 0
        const overlaps = this.getEndOverlaps(this.tmpArray1)
        return this.getBodyDiff(overlaps, result)
    }

    getBodyDiff(overlaps: OverlapKeeperRecord[], result: Body[] = []): Body[] {
        const accumulator = this.tmpDict

        let l: number = overlaps.length

        while (l--) {
            const data: OverlapKeeperRecord = overlaps[l]

            // Since we use body id's for the accumulator, these will be a subset of the original one
            accumulator.set(data.bodyA!.id | 0, data.bodyB!.id | 0, data)
        }

        l = accumulator.keys.length
        while (l--) {
            const data = accumulator.getByKey(accumulator.keys[l])
            if (data) {
                result.push(data.bodyA!, data.bodyB!)
            }
        }

        accumulator.reset()

        return result
    }
}
