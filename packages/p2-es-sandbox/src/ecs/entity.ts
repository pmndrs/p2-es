import * as p2 from 'p2-es'
import { Sprite } from '../pixi/sprite'

export type Entity = {
    physicsBody?: p2.Body
    physicsConstraint?: p2.Constraint
    physicsSpring?: p2.Spring
    physicsWorld?: p2.World
    sprite?: Sprite
}
