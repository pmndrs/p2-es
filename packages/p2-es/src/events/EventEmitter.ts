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
export class EventEmitter<EventMap extends Record<string, { type: string }>> {
    private listeners: { [type: string]: ((e: EventMap[never]) => void)[] } = {}

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
    on<E extends keyof EventMap>(type: E, listener: (e: EventMap[E]) => void): EventEmitter<EventMap> {
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
    off<E extends keyof EventMap>(type: E, listener: (e: EventMap[E]) => void): EventEmitter<EventMap> {
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
    has<E extends keyof EventMap>(type: E, listener?: (e: EventMap[E]) => void): boolean {
        const listeners = this.listeners[type as string]

        if (!listener) {
            return listeners !== undefined
        }

        return listeners !== undefined && listeners.indexOf(listener) !== -1
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
            // only emit to current listeners, ignore listeners that might be added inside a listener function
            for (const listener of [...eventListeners]) {
                listener(event as never)
            }
        }
        return this
    }
}
