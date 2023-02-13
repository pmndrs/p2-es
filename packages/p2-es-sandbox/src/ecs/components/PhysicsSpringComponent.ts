import { Component } from 'arancini'
import { Spring } from 'p2-es'

export class PhysicsSpringComponent extends Component {
    spring!: Spring

    construct(spring: Spring) {
        this.spring = spring
    }
}
