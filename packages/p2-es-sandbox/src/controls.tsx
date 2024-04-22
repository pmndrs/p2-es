import { Leva, button, useControls } from 'leva'
import { ButtonInput } from 'leva/plugin'
import React, { useEffect } from 'react'
import { SandboxSettings, SandboxSettingsStore, usePhysicsWorldStore } from './state'
import { Tool } from './tools'
import { levaTheme } from './ui'

type ButtonGroupControlsProps = {
    options: { name: string; value: string }[]
    current: string
    onChange: (value: string) => void
    hidden?: boolean
}

const useButtonGroupControls = (name: string, { options, current, onChange, hidden }: ButtonGroupControlsProps) => {
    return useControls(
        name,
        () =>
            hidden
                ? {}
                : options.reduce<Record<string, ButtonInput>>((tools, t) => {
                      tools[t.name] = button(
                          () => {
                              onChange(t.value)
                          },
                          {
                              disabled: t.value === current,
                          }
                      )
                      return tools
                  }, {}),
        [current, options, hidden]
    )
}

export type ControlsProps = {
    tool: Tool
    setTool: (tool: Tool) => void

    scene: string
    scenes: string[]
    setScene: (scene: string) => void

    settings: SandboxSettings
    setSettings: SandboxSettingsStore['setSandboxSettings']

    reset: () => void
}

export const Controls = ({ scene, scenes, setScene, tool, setTool, settings, setSettings, reset }: ControlsProps) => {
    const { world: physics } = usePhysicsWorldStore()

    useButtonGroupControls('Scene', {
        options: scenes.map((s, idx) => ({
            name: `${s}${idx < 9 ? ` [${idx + 1}]` : ''}`,
            value: s,
        })),
        current: scene,
        onChange: setScene,
        hidden: scenes.length === 1,
    })

    useButtonGroupControls('Tool', {
        options: [
            { name: 'Pick/Pan [q]', value: Tool.PICK_PAN },
            { name: 'Polygon [d]', value: Tool.POLYGON },
            { name: 'Circle [a]', value: Tool.CIRCLE },
            { name: 'Rectangle [f]', value: Tool.RECTANGLE },
        ],
        current: tool,
        onChange: (value) => setTool(value as Tool),
    })

    const onChange = (value: unknown, propName: string, { initial }: { initial: boolean }) => {
        if (initial) return

        setSettings({ [propName.split('.')[1]]: value })
    }

    const [, setPhysics] = useControls('Physics', () => ({
        paused: {
            label: 'Paused [p] [space]',
            value: settings.paused,
            onChange,
        },
        physicsStepsPerSecond: {
            label: 'Steps per second',
            value: settings.physicsStepsPerSecond,
            onChange,
        },
        maxSubSteps: {
            label: 'Max sub steps',
            value: settings.maxSubSteps,
            onChange,
        },
    }))

    useEffect(() => {
        setPhysics({
            paused: settings.paused,
            physicsStepsPerSecond: settings.physicsStepsPerSecond,
            maxSubSteps: settings.maxSubSteps,
        })
    }, [settings.paused, settings.physicsStepsPerSecond, settings.maxSubSteps])

    const manualStep = () => {
        if (!physics) return

        setSettings({ paused: true })

        const timeStep = 1 / settings.physicsStepsPerSecond
        physics.step(timeStep, timeStep)
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
        [physics, settings, reset]
    )

    const [, setRendering] = useControls('Rendering', () => ({
        drawContacts: {
            label: 'Draw contacts [c]',
            value: settings.drawContacts,
            onChange,
        },
        drawAABBs: {
            label: 'Draw AABBs [t]',
            value: settings.drawAABBs,
            onChange,
        },
        bodyIslandColors: {
            label: 'Body island colors',
            value: settings.bodyIslandColors,
            onChange,
        },
        bodySleepOpacity: {
            label: 'Body sleep opacity',
            value: settings.bodySleepOpacity,
            onChange,
        },
        debugPolygons: {
            label: 'Debug polygons',
            value: settings.debugPolygons,
            onChange,
        },
        renderInterpolatedPositions: {
            label: 'Interpolated positions',
            value: settings.renderInterpolatedPositions,
            onChange,
        },
    }))

    useEffect(() => {
        setRendering({
            drawContacts: settings.drawContacts,
            drawAABBs: settings.drawAABBs,
            bodyIslandColors: settings.bodyIslandColors,
            bodySleepOpacity: settings.bodySleepOpacity,
            debugPolygons: settings.debugPolygons,
            renderInterpolatedPositions: settings.renderInterpolatedPositions,
        })
    }, [
        settings.drawContacts,
        settings.drawAABBs,
        settings.bodyIslandColors,
        settings.bodySleepOpacity,
        settings.debugPolygons,
        settings.renderInterpolatedPositions,
    ])

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null

            if (target && (target.nodeName === 'INPUT' || target.nodeName === 'BUTTON')) {
                return
            }

            const key = event.key.toLowerCase()

            if (key === 'q') {
                return setTool(Tool.PICK_PAN)
            }

            if (key === 'd') {
                return setTool(Tool.POLYGON)
            }

            if (key === 'a') {
                return setTool(Tool.CIRCLE)
            }

            if (key === 'f') {
                return setTool(Tool.RECTANGLE)
            }

            if (key === 'p' || key === ' ') {
                return setSettings((current) => ({ ...current, paused: !current.paused }))
            }

            if (key === 'c') {
                return setSettings((current) => ({ ...current, drawContacts: !current.drawContacts }))
            }

            if (key === 't') {
                return setSettings((current) => ({ ...current, drawAABBs: !current.drawAABBs }))
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

        window.addEventListener('keydown', handler)

        return () => {
            window.removeEventListener('keydown', handler)
        }
    }, [physics, settings, reset])

    return <Leva fill flat theme={levaTheme} titleBar={false} />
}
