import { Component, ComponentDefinition, World } from 'arancini'
import { createECS } from 'arancini/react'
import * as p2 from 'p2-es'
import { Application, Container, FederatedMouseEvent, Graphics } from 'pixi.js'
import { useEffect, useMemo, useRef } from 'react'

export interface SandboxSettings {
    physicsStepsPerSecond: number
    maxSubSteps: number
    paused: boolean
    bodyIslandColors: boolean
    bodySleepOpacity: boolean
    debugPolygons: boolean
    drawContacts: boolean
    drawAABBs: boolean
    renderInterpolatedPositions: boolean
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
}

export const defaultSandboxSettings: SandboxSettings = {
    physicsStepsPerSecond: 60,
    maxSubSteps: 3,
    paused: false,
    bodyIslandColors: false,
    bodySleepOpacity: false,
    debugPolygons: false,
    drawContacts: false,
    drawAABBs: false,
    renderInterpolatedPositions: true,
}

export type Settings = SandboxSettings & {
    // computed
    timeStep: number
}

export const SettingsComponent = Component.object<Settings>('settings')

export const AppComponent = Component.object<HTMLDivElement>('app')

export const PhysicsBodyComponent = Component.object<p2.Body>('physics body')

export const PhysicsConstraintComponent = Component.object<p2.Constraint>('physics constraint')

export const PhysicsSpringComponent = Component.object<p2.Spring>('physics spring')

export const PhysicsWorldComponent = Component.object<p2.World>('physics world')

export type Pixi = {
    domElement: HTMLElement
    canvasElement: HTMLCanvasElement
    application: Application
    stage: Container
    container: Container
    background: Graphics
    graphics: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
        drawShape: Graphics
    }
    onResize: () => void
}

export const PixiComponent = Component.object<Pixi>('pixi')

export type PointerPositions = {
    stagePosition: [number, number]
    physicsPosition: [number, number]
}

export type Touches = {
    [key: string]: PointerPositions
}

export class PointerComponent extends Component {
    id = 0

    primaryPointer: PointerPositions = {
        stagePosition: [0, 0],
        physicsPosition: [0, 0],
    }

    touches: Touches = {}

    pinching = false

    pinchInitialLength?: number

    pinchLength?: number

    pinchATouch?: string

    pinchBTouch?: string

    onPinchStart = new Set<() => void>()

    onPinchMove = new Set<() => void>()

    onPinchEnd = new Set<() => void>()

    onUp = new Set<(e: FederatedMouseEvent) => void>()

    onDown = new Set<(e: FederatedMouseEvent) => void>()

    onMove = new Set<(e: FederatedMouseEvent) => void>()

    onWheel = new Set<(delta: number) => void>()

    construct() {
        this.id++

        this.primaryPointer.stagePosition[0] = 0
        this.primaryPointer.stagePosition[1] = 0

        this.primaryPointer.physicsPosition[0] = 0
        this.primaryPointer.physicsPosition[1] = 0

        this.touches = {}

        this.onPinchStart.clear()
        this.onPinchMove.clear()
        this.onPinchEnd.clear()
        this.onUp.clear()
        this.onDown.clear()
        this.onMove.clear()
    }
}

export class SpriteComponent extends Component {
    graphics!: Graphics

    drawnSleeping!: boolean | null

    drawnLineColor!: number | null

    drawnFillColor!: number | null

    dirty!: boolean

    construct() {
        this.graphics = new Graphics()
        this.drawnSleeping = null
        this.drawnLineColor = null
        this.drawnFillColor = null
        this.dirty = false
    }

    onDestroy(): void {
        this.graphics.destroy()
    }
}

type UpdateHandler = { current: (delta: number) => void }

export class UpdateHandlerComponent extends Component {
    fn!: UpdateHandler

    priority!: number

    construct(fn: UpdateHandler, priority: number) {
        this.fn = fn
        this.priority = priority
    }
}

export const world = new World()
export const ecs = createECS(world)

world.registerComponent(AppComponent)
world.registerComponent(PhysicsBodyComponent)
world.registerComponent(PhysicsSpringComponent)
world.registerComponent(PhysicsWorldComponent)
world.registerComponent(PhysicsConstraintComponent)
world.registerComponent(PixiComponent)
world.registerComponent(SettingsComponent)
world.registerComponent(SpriteComponent)
world.registerComponent(PointerComponent)
world.registerComponent(UpdateHandlerComponent)

world.init()

const createStages = <T extends Array<string>>(steps: [...T]) => {
    const schedule: Partial<Record<T[number], number>> = {}

    for (let i = 0; i < steps.length; i++) {
        schedule[steps[i]] = i
    }

    return schedule as Record<T[number], number>
}

export const STAGES = createStages([
    'SANDBOX_HANDLERS',
    'PHYSICS',
    'RENDER_BODIES',
    'RENDER_SPRINGS',
    'RENDER_AABBS',
    'RENDER_CONTACTS',
    'RENDER_TOOL',
])

const VISIBILITY_CHANGE_EVENT = 'visibilitychange'
const VISIBLE_STATE = 'visible'

const usePageVisible = () => {
    const visible = useRef(true)

    useEffect(() => {
        const onPageVisibilityChange = () => {
            if (document.visibilityState === VISIBLE_STATE) {
                requestAnimationFrame(() => {
                    visible.current = true
                })
            } else {
                visible.current = false
            }
        }

        document.addEventListener(VISIBILITY_CHANGE_EVENT, onPageVisibilityChange)

        return () => {
            document.removeEventListener(VISIBILITY_CHANGE_EVENT, onPageVisibilityChange)
        }
    }, [])

    return visible
}

const loop = (fn: (delta: number) => void) => {
    let animationFrameRequest = 0
    let previousTime: undefined | number

    const animate = (time: number) => {
        const timeMs = time / 1000
        if (previousTime !== undefined) {
            const delta = timeMs - previousTime

            const clampedDelta = Math.min(delta, 1)

            fn(clampedDelta)
        }
        previousTime = timeMs
        animationFrameRequest = requestAnimationFrame(animate)
    }

    animationFrameRequest = requestAnimationFrame(animate)

    return () => {
        cancelAnimationFrame(animationFrameRequest)
    }
}

export const Loop = () => {
    const pageVisible = usePageVisible()

    useEffect(() => {
        const updateHandlersQuery = ecs.world.query([UpdateHandlerComponent])

        let sortedUpdateHandlers: UpdateHandlerComponent[] = []

        const sortHandlers = () => {
            sortedUpdateHandlers = updateHandlersQuery.entities
                .map((e) => e.get(UpdateHandlerComponent))
                .sort((a, b) => a.priority - b.priority)
        }

        updateHandlersQuery.onEntityAdded.add(() => sortHandlers())
        updateHandlersQuery.onEntityRemoved.add(() => sortHandlers())

        const stop = loop((delta) => {
            if (!pageVisible.current) return

            sortedUpdateHandlers.forEach((handler) => handler.fn.current(delta))
        })

        return () => {
            updateHandlersQuery.onEntityAdded.remove(sortHandlers)
            updateHandlersQuery.onEntityRemoved.remove(sortHandlers)
            updateHandlersQuery.destroy()
            stop()
        }
    }, [ecs])

    return null
}

const useMutableCallback = <T,>(fn: T) => {
    const ref = useRef<T>(fn)
    useEffect(() => {
        ref.current = fn
    }, [fn])
    return ref
}

export const useFrame = (fn: (delta: number) => void, priority = 0) => {
    const ref = useMutableCallback(fn)

    useEffect(() => {
        const entity = ecs.world.create()
        entity.add(UpdateHandlerComponent, ref, priority)

        return () => {
            entity.destroy()
        }
    }, [])
}

export const useSingletonComponent = <T extends ComponentDefinition<unknown>>(componentDefinition: T) => {
    const query = ecs.useQuery([componentDefinition])

    return useMemo(() => {
        const entity = query.first
        if (!entity) {
            return null
        }

        const component = entity.find(componentDefinition)
        if (!component) {
            return null
        }

        return component
    }, [query])
}
