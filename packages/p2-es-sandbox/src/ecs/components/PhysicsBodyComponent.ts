import { Component } from 'arancini'
import { Body } from 'p2-es'

export class PhysicsBodyComponent extends Component {
    body!: Body

    construct(body: Body) {
        this.body = body
    }
}
