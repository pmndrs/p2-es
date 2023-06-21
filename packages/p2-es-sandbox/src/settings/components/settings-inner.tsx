import { button, LevaPanel, useControls, useStoreContext } from 'leva'
import React, { useEffect, useMemo } from 'react'
import {
    AppComponent,
    ecs,
    PhysicsWorldComponent,
    Settings,
    SettingsComponent,
    useSingletonComponent,
} from '../../ecs'
import { Tool, Tools } from '../../tools'
import { levaTheme } from '../../ui'
import { useButtonGroupControls } from '../hooks'
import { SettingsProps } from './settings'

export const SettingsInner = ({
    scene,
    scenes,
    setScene,
    tool,
    setTool,
    defaultSettings,
    reset,
    hidden,
}: SettingsProps) => {
    const store = useStoreContext()

    const app = useSingletonComponent(AppComponent)
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)

    useButtonGroupControls('Scene', {
        options: scenes.map((s, idx) => ({
            name: `${s}${idx < 9 ? ` [${idx + 1}]` : ''}`,
            value: s,
        })),
        current: scene,
        onChange: setScene,
        hidden: scenes.length === 1,
        store,
    })

    useButtonGroupControls('Tool', {
        options: [
            { name: 'Pick/Pan [q]', value: Tools.PICK_PAN },
            { name: 'Polygon [d]', value: Tools.POLYGON },
            { name: 'Circle [a]', value: Tools.CIRCLE },
            { name: 'Rectangle [f]', value: Tools.RECTANGLE },
        ],
        current: tool,
        onChange: (value) => setTool(value as Tool),
        store,
    })

    const [{ physicsStepsPerSecond, maxSubSteps, paused }, setPhysics] =
        useControls(
            'Physics',
            () => ({
                paused: {
                    label: 'Paused [p] [space]',
                    value: defaultSettings.paused,
                },
                physicsStepsPerSecond: {
                    label: 'Steps per second',
                    value: defaultSettings.physicsStepsPerSecond,
                },
                maxSubSteps: {
                    label: 'Max sub steps',
                    value: defaultSettings.maxSubSteps,
                },
            }),
            { store }
        )

    const timeStep = 1 / physicsStepsPerSecond

    const manualStep = () => {
        if (!physicsWorld) return

        const { world } = physicsWorld

        setPhysics({ paused: true })
        world.step(timeStep, timeStep)
    }

    useControls(
        'Actions',
        {
            'Manual Step [s]': button(() => {
                manualStep()
            }),
            'Reset [r]': button(() => {
                reset()
            }),
        },
        { store },
        [physicsWorld, timeStep, reset]
    )

    const [
        {
            bodyIslandColors,
            bodySleepOpacity,
            drawContacts,
            drawAABBs,
            debugPolygons,
            renderInterpolatedPositions,
        },
        setRendering,
    ] = useControls(
        'Rendering',
        () => ({
            drawContacts: {
                label: 'Draw contacts [c]',
                value: defaultSettings.drawContacts,
            },
            drawAABBs: {
                label: 'Draw AABBs [t]',
                value: defaultSettings.drawAABBs,
            },
            bodyIslandColors: {
                label: 'Body island colors',
                value: defaultSettings.bodyIslandColors,
            },
            bodySleepOpacity: {
                label: 'Body sleep opacity',
                value: defaultSettings.bodyIslandColors,
            },
            debugPolygons: {
                label: 'Debug polygons',
                value: defaultSettings.debugPolygons,
            },
            renderInterpolatedPositions: {
                label: 'Interpolated positions',
                value: defaultSettings.renderInterpolatedPositions,
            },
        }),
        { store }
    )

    useEffect(() => {
        if (!app) return

        const handler = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null

            if (
                target &&
                (target.nodeName === 'INPUT' || target.nodeName === 'BUTTON')
            ) {
                return
            }

            const key = event.key.toLowerCase()

            if (key === 'q') {
                return setTool(Tools.PICK_PAN)
            }

            if (key === 'd') {
                return setTool(Tools.POLYGON)
            }

            if (key === 'a') {
                return setTool(Tools.CIRCLE)
            }

            if (key === 'f') {
                return setTool(Tools.RECTANGLE)
            }

            if (key === 'p' || key === ' ') {
                return setPhysics({ paused: !paused })
            }

            if (key === 'c') {
                return setRendering({ drawContacts: !drawContacts })
            }

            if (key === 't') {
                return setRendering({ drawAABBs: !drawAABBs })
            }

            if (key === 's') {
                return manualStep()
            }

            if (key === 'r') {
                return reset()
            }

            const n = Number(key)
            if (!Number.isNaN(n)) {
                const sceneIndex = Number(key) - 1
                if (sceneIndex > -1 && sceneIndex < scenes.length) {
                    return setScene(scenes[sceneIndex])
                }
            }
        }

        app.appWrapperElement.addEventListener('keydown', handler)

        return () => {
            app.appWrapperElement.removeEventListener('keydown', handler)
        }
    }, [physicsWorld?.id, app?.id, paused, drawContacts, drawAABBs, reset])

    useEffect(() => {
        setPhysics({
            physicsStepsPerSecond: defaultSettings.physicsStepsPerSecond,
            maxSubSteps: defaultSettings.maxSubSteps,
            paused: defaultSettings.paused,
        })
        setRendering({
            bodyIslandColors: defaultSettings.bodyIslandColors,
            bodySleepOpacity: defaultSettings.bodySleepOpacity,
            drawContacts: defaultSettings.drawContacts,
            drawAABBs: defaultSettings.drawAABBs,
            debugPolygons: defaultSettings.debugPolygons,
            renderInterpolatedPositions:
                defaultSettings.renderInterpolatedPositions,
        })
    }, [defaultSettings])

    const settings: Settings = useMemo(
        () => ({
            physicsStepsPerSecond,
            timeStep,
            maxSubSteps,
            paused,
            renderInterpolatedPositions,
            bodyIslandColors,
            bodySleepOpacity,
            drawContacts,
            drawAABBs,
            debugPolygons,
        }),
        [
            physicsStepsPerSecond,
            timeStep,
            maxSubSteps,
            paused,
            renderInterpolatedPositions,
            bodyIslandColors,
            bodySleepOpacity,
            drawContacts,
            drawAABBs,
            debugPolygons,
        ]
    )

    return (
        <>
            <LevaPanel
                store={store}
                fill
                flat
                theme={levaTheme}
                titleBar={false}
                hidden={hidden}
            />
            <ecs.Entity>
                <ecs.Component type={SettingsComponent} args={[settings]} />
            </ecs.Entity>
        </>
    )
}
