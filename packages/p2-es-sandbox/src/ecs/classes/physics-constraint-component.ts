import { Component } from 'arancini'
import { Constraint } from 'p2-es'

export class PhysicsConstraintComponent extends Component {
    constraint!: Constraint

    construct(constraint: Constraint) {
        this.constraint = constraint
    }
}
