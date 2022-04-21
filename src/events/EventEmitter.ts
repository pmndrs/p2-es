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
    private listeners: { [type: string]: Function[] } = {}

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
    on<E extends keyof EventMap>(type: E, listener: (e: EventMap[E]) => void, context?: any): EventEmitter<EventMap> {
        (listener as any).context = context || this
        let listeners = this.listeners[type as string]
        if (listeners === undefined) {
            listeners = []
            this.listeners[type as string] = listeners
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
    off<E extends keyof EventMap>(type: E, listener: Function): EventEmitter<EventMap> {
        const listeners = this.listeners[type as string]
        if (listeners) {
            const index = listeners.indexOf(listener)
            if (index !== -1) {
                listeners.splice(index, 1)
            }
        }
        return this
    }

    /**
     * Check if an event listener is added
     * @param type
     * @param listener
     * @return
     */
    has<E extends keyof EventMap>(type: E, listener?: Function): boolean {
        if (this.listeners === undefined) {
            return false
        }
        const listeners = this.listeners[type as string]
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
    emit<E extends keyof EventMap>(event: EventMap[E]): EventEmitter<EventMap> {
        if (this.listeners === undefined) {
            return this
        }
        const eventListeners = this.listeners[event.type]

        if (eventListeners !== undefined) {
            const toEmit = {
                ...event,
                target: this,
            }

            // only emit to current listeners, ignore listeners that might be added inside a listener function
            for (const listener of [...eventListeners]) {
                listener.call((listener as any).context, toEmit)
            }
        }
        return this
    }
}
