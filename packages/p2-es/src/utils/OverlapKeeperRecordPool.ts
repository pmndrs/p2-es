import { Body } from '../objects/Body'
import { Circle } from '../shapes/Circle'
import { OverlapKeeperRecord } from './OverlapKeeperRecord'
import { Pool } from './Pool'

export class OverlapKeeperRecordPool extends Pool<OverlapKeeperRecord> {
    create(): OverlapKeeperRecord {
        return new OverlapKeeperRecord(tmpBody, tmpShape, tmpBody, tmpShape)
    }
    destroy(record: OverlapKeeperRecord): OverlapKeeperRecordPool {
        record.bodyA = record.bodyB = tmpBody
        record.shapeA = record.shapeB = tmpShape
        return this
    }
}

const tmpShape = new Circle({ radius: 1 })
const tmpBody = new Body()
