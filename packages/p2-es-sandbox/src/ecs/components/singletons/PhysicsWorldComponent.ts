import { Component } from 'arancini'
import { World } from 'p2-es'

export class PhysicsWorldComponent extends Component {
    world!: World

    construct(world: World) {
        this.world = world
    }
}
