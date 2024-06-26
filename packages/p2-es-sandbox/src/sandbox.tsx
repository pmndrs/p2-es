import * as p2 from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Controls } from './controls'
import { world } from './ecs'
import { useFrame } from './hooks/use-frame'
import { Physics } from './physics'
import { PhysicsAABBRenderer, PhysicsBodyRenderer, PhysicsContactRenderer, PhysicsSpringRenderer } from './pixi'
import { SandboxFunction, Scenes, createSandbox } from './sandbox-api'
import { defaultSandboxSettings, usePhysicsWorldStore, usePixiStore, usePointerStore, useSandboxSettings } from './state'
import { CircleTool, PickPanTool, PolygonTool, RectangleTool, Tool } from './tools'
import { PointerEvents } from './tools/pointer-events'
import { interfaceTheme, up } from './ui'
import { Header } from './ui/header'

const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;

    &.settings-enabled {
        overflow: auto;

        ${up('md')} {
            overflow: hidden;
        }
    }

    ${up('md')} {
        flex-direction: row;
    }
`

const SandboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    height: 100%;

    &:focus {
        outline: none;
    }
`

const CanvasWrapper = styled.div`
    position: relative;

    flex: 1;
    width: 100%;

    min-height: 70%;
    max-height: 70%;
    height: 70%;

    &.settings-hidden {
        min-height: 100%;
        max-height: 100%;
        height: 100%;
    }

    ${up('md')} {
        min-height: unset;
        max-height: unset;
        height: 100%;
    }

    &:focus,
    &:focus-visible,
    &:focus-within {
        outline: none;
    }
`

const ControlsWrapper = styled.div`
    flex: 1;
    width: 100%;
    min-height: 300px;
    background-color: ${interfaceTheme.color.background};

    ${up('md')} {
        flex: none;
        width: 320px;
        height: 100%;
        min-height: unset;
        overflow-y: scroll;
    }
`

export type SandboxProps = {
    setup: SandboxFunction | Scenes
    title?: string
    codeLink?: string
    showControls: boolean
    showHeader: boolean
    enablePanning?: boolean
    enableZooming?: boolean
}

export const Sandbox = ({
    title,
    setup,
    codeLink,
    showControls: initialShowControls,
    showHeader,
    enablePanning = true,
    enableZooming = true,
}: SandboxProps) => {
    const canvasWrapperElement = useRef<HTMLDivElement>(null!)

    const pixi = usePixiStore()
    const pointer = usePointerStore()

    const { setSandboxSettings, ...sandboxSettings } = useSandboxSettings()
    const { debugPolygons, bodySleepOpacity } = sandboxSettings

    const scenes = typeof setup === 'function' ? { default: { setup } } : setup
    const sceneNames = Object.keys(scenes)
    const [scene, setScene] = useState(sceneNames[0])
    const [sceneVersion, setSceneVersion] = useState(0)
    const resetScene = () => setSceneVersion((v) => v + 1)

    const [tool, setTool] = useState<Tool>(Tool.PICK_PAN)
    const [showControls, setShowControls] = useState(initialShowControls)

    const [sandboxUpdateHandlers, setSandboxUpdateHandlers] = useState<Set<(delta: number) => void> | undefined>()

    useEffect(() => {
        canvasWrapperElement.current.appendChild(pixi!.canvasElement)
        canvasWrapperElement.current.focus()
        canvasWrapperElement.current.tabIndex = 0

        return () => {
            canvasWrapperElement.current?.removeChild(pixi!.canvasElement)
        }
    }, [])

    useEffect(() => {
        pixi?.onResize()
    }, [pixi, showControls])

    /* dirty sprites state when settings change */
    useEffect(() => {
        world
            .filter((e) => e.with('physicsBody', 'sprite'))
            .forEach((e) => {
                e.sprite.dirty = true
            })
    }, [debugPolygons, bodySleepOpacity])

    useEffect(() => {
        const {
            world: physicsWorld,
            tools,
            updateHandlers,
            sandboxContext,
            settings: newSandboxSettings,
            destroySandbox,
        } = createSandbox({
            pixi,
            pointer,
            sandboxFunction: scenes[scene].setup,
        })

        setSandboxSettings({
            ...defaultSandboxSettings,
            enablePanning,
            enableZooming,
            ...newSandboxSettings,
        })

        if (tools?.default) {
            setTool(tools.default)
        }

        // set the sandbox update handlers
        setSandboxUpdateHandlers(updateHandlers)

        // create physics world singleton
        usePhysicsWorldStore.setState({ world: physicsWorld })

        // set window globals
        const globalWindow = window as unknown as Record<string, unknown>
        globalWindow.world = physicsWorld
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext
        globalWindow.ecs = world

        return () => {
            setSandboxUpdateHandlers(undefined)

            destroySandbox()

            const entities = [...world.query((e) => e.some('physicsBody', 'physicsSpring'))]

            entities.forEach((entity) => {
                world.destroy(entity)
            })
        }
    }, [pixi, pointer, scene, sceneVersion])

    useFrame((delta) => {
        if (!sandboxUpdateHandlers) return
        sandboxUpdateHandlers.forEach((fn) => fn(delta))
    })

    return (
        <>
            <Physics />
            <PointerEvents />

            <PhysicsAABBRenderer />
            <PhysicsBodyRenderer />
            <PhysicsContactRenderer />
            <PhysicsSpringRenderer />

            <SandboxContainer tabIndex={0}>
                {showHeader && (
                    <Header
                        title={title}
                        codeLink={codeLink}
                        sceneNames={sceneNames}
                        scene={scene}
                        resetScene={resetScene}
                        toggleShowSceneControls={() => setShowControls((s) => !s)}
                    />
                )}

                <Main className={showControls ? 'settings-enabled' : ''}>
                    <CanvasWrapper ref={canvasWrapperElement} className={showControls ? '' : 'settings-hidden'} />

                    {showControls && (
                        <ControlsWrapper>
                            <Controls
                                tool={tool}
                                setTool={(t) => setTool(t)}
                                scene={scene}
                                scenes={sceneNames}
                                setScene={setScene}
                                settings={sandboxSettings}
                                setSettings={setSandboxSettings}
                                reset={resetScene}
                            />
                        </ControlsWrapper>
                    )}
                </Main>
            </SandboxContainer>

            {!showControls ? (
                // default to pick pan tool if controls are hidden
                <PickPanTool />
            ) : (
                <>
                    {tool === Tool.PICK_PAN && <PickPanTool />}
                    {tool === Tool.POLYGON && <PolygonTool />}
                    {tool === Tool.CIRCLE && <CircleTool />}
                    {tool === Tool.RECTANGLE && <RectangleTool />}
                </>
            )}
        </>
    )
}
