/* eslint-disable @typescript-eslint/ban-types */

/**
 * Base class for objects that dispatches events.
 *
 * @example
 *     var emitter = new EventEmitter();
 *     emitter.on('myEvent', function(evt){
 *         console.log(evt.message);
 *     });
 *     emitter.emit({
 *         type: 'myEvent',
 *         message: 'Hello world!'
 *     });
 */
export class EventEmitter<EventMap extends Record<string, any>> {
    private tmpArray: Function[] = []
    private listeners: Partial<Record<keyof EventMap, Function[]>> = {}

    /**
     * Add an event listener
     * @param type
     * @param listener
     * @return The self object, for chainability.
     * @example
     *     emitter.on('myEvent', function(evt){
     *         console.log('myEvt was triggered!');
     *     });
     */
    on<EventName extends keyof EventMap>(
        type: EventName,
        listener: (e: EventMap[EventName]) => void,
        context?: any
    ) {
        (listener as any).context = context || this
        let listeners = this.listeners[type]
        if (listeners === undefined) {
            listeners = []
            this.listeners[type] = listeners   
        }
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener)
        }
        return this
    }

    /**
     * Remove an event listener
     * @param type
     * @param listener
     * @return The self object, for chainability.
     * @example
     *     emitter.on('myEvent', handler); // Add handler
     *     emitter.off('myEvent', handler); // Remove handler
     */
    off<EventName extends keyof EventMap>(type: EventName, listener: Function): EventEmitter<EventMap> {
        const listeners = this.listeners[type]
        if (!listeners) {
            return this
        }
        const index = listeners.indexOf(listener)
        if (index !== -1) {
            listeners.splice(index, 1)
        }
        return this
    }

    /**
     * Check if an event listener is added
     * @method has
     * @param type
     * @param listener
     * @return
     */
    has<EventName extends keyof EventMap>(type: EventName, listener?: Function): boolean {
        if (this.listeners === undefined) {
            return false
        }
        const listeners = this.listeners[type]
        if (listener) {
            if (listeners !== undefined && listeners.indexOf(listener) !== -1) {
                return true
            }
        } else {
            if (listeners !== undefined) {
                return true
            }
        }

        return false
    }

    /**
     * Emit an event.
     * @param event
     * @param event.type
     * @return The self object, for chainability.
     * @example
     *     emitter.emit({
     *         type: 'myEvent',
     *         customData: 123
     *     });
     */
    emit<E extends keyof EventMap>(event: EventMap[E]) {
        if (this.listeners === undefined) {
            return this
        }
        const listeners = this.listeners
        const listenerArray = listeners[event.type]

        if (listenerArray !== undefined) {
            const toEmit = {
                ...event,
                target: this,
            }

            // Need to copy the listener array, in case some listener was added/removed inside a listener
            const tmpArray = this.tmpArray
            for (let i = 0, l = listenerArray.length; i < l; i++) {
                tmpArray[i] = listenerArray[i]
            }
            for (let i = 0, l = tmpArray.length; i < l; i++) {
                const listener = tmpArray[i]
                listener.call((listener as any).context, toEmit)
            }
            tmpArray.length = 0
        }
        return this
    }
}
