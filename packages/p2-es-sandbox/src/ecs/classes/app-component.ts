import { Component } from 'arancini'

export class AppComponent extends Component {
    appWrapperElement!: HTMLDivElement

    construct(appWrapperElement: HTMLDivElement) {
        this.appWrapperElement = appWrapperElement
    }
}
