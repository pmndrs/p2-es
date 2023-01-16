import { Component } from 'arancini'

type UpdateHandler = { current: (delta: number) => void }

export class UpdateHandlerComponent extends Component {
    fn!: UpdateHandler

    priority!: number

    construct(fn: UpdateHandler, priority: number) {
        this.fn = fn
        this.priority = priority
    }
}
