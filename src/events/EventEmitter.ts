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
export class EventEmitter {
    private tmpArray: Function[] = []
    private _listeners: { [type: string]: Function[] } = {}

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
    on(type: string, listener: () => void, context?: any) {
        (listener as any).context = context || this
        const listeners = this._listeners
        if (listeners[type] === undefined) {
            listeners[type] = []
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener)
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
    off(type: string, listener: Function): EventEmitter {
        const listeners = this._listeners
        if (!listeners || !listeners[type]) {
            return this
        }
        const index = listeners[type].indexOf(listener)
        if (index !== -1) {
            listeners[type].splice(index, 1)
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
    has(type: string, listener?: Function): boolean {
        if (this._listeners === undefined) {
            return false
        }
        const listeners = this._listeners
        if (listener) {
            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
                return true
            }
        } else {
            if (listeners[type] !== undefined) {
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
    emit<T extends { type: string }>(event: T) {
        if (this._listeners === undefined) {
            return this
        }
        const listeners = this._listeners
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
