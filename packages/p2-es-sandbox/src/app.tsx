import * as p2 from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { Controls } from './controls'
import {
    CircleTool,
    EcsContext,
    EcsProvider,
    PickPanTool,
    PolygonTool,
    RectangleTool,
    SandboxSettings,
    Tool,
    Tools,
    defaultSandboxSettings,
    useECS,
    useFrame,
    useSingletonComponent
} from './ecs'
import { SandboxFunction, Scenes, createSandbox } from './sandbox'
import { CanvasWrapper, ControlsWrapper, Main, SandboxContainer, styledComponentsTheme } from './ui'
import { Header } from './ui/header'

export type AppProps = {
    setup: SandboxFunction | Scenes
    title?: string
    codeLink?: string
    ecs: EcsContext
    showControls: boolean
    showHeader: boolean
    enablePanning?: boolean
    enableZooming?: boolean
}

const AppInner = ({
    title,
    setup,
    codeLink,
    showControls: initialShowControls,
    showHeader,
    enablePanning = true,
    enableZooming = true,
}: AppProps) => {
    const { world, executor, react: { Entity, Component }} = useECS()

    const sandboxContainerRef = useRef<HTMLDivElement>(null)
    const canvasWrapperElement = useRef<HTMLDivElement>(null)

    /* state and function for resetting the current scene */
    const [sceneVersion, setSceneVersion] = useState(0)
    const resetScene = () => setSceneVersion((v) => v + 1)

    /* scene state */
    const scenes = typeof setup === 'function' ? { default: { setup } } : setup
    const sceneNames = Object.keys(scenes)
    const [scene, setScene] = useState(sceneNames[0])
    const previousScene = useRef<string | null>(null)

    /* current tool */
    const [tool, setTool] = useState<Tool>(Tools.PICK_PAN)

    /* controls visibility, initially set by props */
    const [showControls, setShowControls] = useState(initialShowControls)
    const [sandboxSettings, setSandboxSettings] = useState<SandboxSettings>(defaultSandboxSettings)

    /* user-land handlers */
    const [sandboxUpdateHandlers, setSandboxUpdateHandlers] = useState<Set<(delta: number) => void> | undefined>()

    const pixi = useSingletonComponent('pixi')
    const pointer = useSingletonComponent('pointer')
    const settings = useSingletonComponent('sandboxSettings')

    useEffect(() => {
        canvasWrapperElement.current!.appendChild(pixi!.canvasElement)

        canvasWrapperElement.current!.focus()

        // set tabIndex to enable keyboard events
        canvasWrapperElement.current!.tabIndex = 0

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
    }, [settings?.debugPolygons, settings?.bodySleepOpacity])

    useEffect(() => {
        if (!pixi || !pixi.application.renderer || !pointer) return

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
        const physicsEntity = world.create({ physicsWorld: physicsWorld })

        // set window globals
        const globalWindow = window as unknown as Record<string, unknown>
        globalWindow.world = physicsWorld
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext
        globalWindow.ecs = world

        return () => {
            previousScene.current = scene

            setSandboxUpdateHandlers(undefined)

            destroySandbox()

            const entities = [physicsEntity, ...world.query((e) => e.some('physicsBody', 'physicsSpring'))]

            entities.forEach((entity) => {
            world.destroy(entity)
            })
        }
    }, [pixi, pointer, scene, sceneVersion])

    useFrame((delta) => {
        executor.update(delta)

        if (!sandboxUpdateHandlers) return
        sandboxUpdateHandlers.forEach((fn) => fn(delta))
    })

    return (
        <>
            <SandboxContainer ref={sandboxContainerRef} tabIndex={0}>
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
                    {tool === Tools.PICK_PAN && <PickPanTool />}
                    {tool === Tools.POLYGON && <PolygonTool />}
                    {tool === Tools.CIRCLE && <CircleTool />}
                    {tool === Tools.RECTANGLE && <RectangleTool />}
                </>
            )}

            <Entity>
                <Component name="sandboxSettings" value={sandboxSettings} />
            </Entity>
        </>
    )
}

export const App = (props: AppProps) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={styledComponentsTheme}>
                <EcsProvider ecs={props.ecs}>
                    <AppInner {...props} />
                </EcsProvider>
            </ThemeProvider>
        </React.StrictMode>
    )
}
