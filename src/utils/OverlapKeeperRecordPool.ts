import { OverlapKeeperRecord } from './OverlapKeeperRecord'
import { Pool } from './Pool'

export class OverlapKeeperRecordPool extends Pool<OverlapKeeperRecord> {
    create(): OverlapKeeperRecord {
        return new OverlapKeeperRecord()
    }
    destroy(record: OverlapKeeperRecord): OverlapKeeperRecordPool {
        record.bodyA = record.bodyB = record.shapeA = record.shapeB = undefined
        return this
    }
}
