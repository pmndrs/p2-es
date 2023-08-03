import { EventEmitter } from '../../src/events/EventEmitter'

describe('EventEmitter', () => {
    test('construct', () => {
        new EventEmitter()
    })

    test('has', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const listener = () => {}

        const emitter = new EventEmitter()
        emitter.on('event', listener)

        expect(emitter.has('event')).toBeTruthy
    })

    test('on', () => {
        let calls = 0
        const listener = function () {
            calls++
        }
        const emitter = new EventEmitter()
        emitter.on('event', listener)
        expect(calls).toBe(0)

        emitter.emit({ type: 'event' })
        expect(calls).toBe(1)
    })

    test('off', () => {
        let calls = 0
        const listener = function () {
            calls++
        }
        const emitter = new EventEmitter()
        emitter.on('event', listener)
        expect(calls).toBe(0)

        emitter.emit({ type: 'event' })
        expect(calls).toBe(1)

        emitter.off('event', listener)
        emitter.emit({ type: 'event' })
        expect(calls).toBe(1)

        // Do it again!
        emitter.off('event', listener)
        emitter.emit({ type: 'event' })
        expect(calls).toBe(1)
    })
})
