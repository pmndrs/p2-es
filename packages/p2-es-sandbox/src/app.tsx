import { Entity } from 'arancini'
import { createECS } from 'arancini/react'
import * as p2 from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { Controls } from './controls'
import {
    CircleTool,
    EcsProvider,
    PhysicsBodyComponent,
    PhysicsSpringComponent,
    PhysicsWorldComponent,
    PickPanTool,
    PixiComponent,
    PointerComponent,
    PolygonTool,
    RectangleTool,
    SandboxSettings,
    SettingsComponent,
    SpriteComponent,
    Tool,
    Tools,
    defaultSandboxSettings,
    useECS,
    useFrame,
    useSingletonComponent,
} from './ecs'
import { useConst } from './hooks'
import { SandboxFunction, Scenes, createSandbox } from './sandbox'
import {
    CanvasWrapper,
    CodeSvg,
    ControlsWrapper,
    ExternalLink,
    ExternalLinkSvg,
    Header,
    HeaderButton,
    HeaderButtons,
    HeaderMiddle,
    HeaderSandboxTitle,
    Main,
    PencilSvg,
    RefreshSvg,
    SandboxContainer,
    styledComponentsTheme,
} from './ui'

export type AppProps = {
    setup: SandboxFunction | Scenes
    title?: string
    codeLink?: string
    ecs: ReturnType<typeof createECS>
    showControls: boolean
    showHeader: boolean
    enablePanning: boolean
}

const AppInner = ({ title, setup, codeLink, showControls: initialShowControls, showHeader, enablePanning }: AppProps) => {
    const ecs = useECS()

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

    const bodyEntities: Map<p2.Body, Entity> = useConst(() => new Map())
    const springEntities: Map<p2.Spring, Entity> = useConst(() => new Map())

    const pixi = useSingletonComponent(PixiComponent)
    const pointer = useSingletonComponent(PointerComponent)
    const settings = useSingletonComponent(SettingsComponent)

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
        ecs.world.find([PhysicsBodyComponent, SpriteComponent]).forEach((e) => {
            e.get(SpriteComponent).dirty = true
        })
    }, [settings?.debugPolygons, settings?.bodySleepOpacity])

    useEffect(() => {
        if (!pixi || !pixi.application.renderer || !pointer) return

        const {
            world,
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
            ...newSandboxSettings,
        })

        if (tools?.default) {
            setTool(tools.default)
        }

        // create entities for existing physics bodies and springs
        const addBodyEntity = (body: p2.Body) => {
            const entity = ecs.world.create((e) => {
                e.add(PhysicsBodyComponent, body)
            })

            bodyEntities.set(body, entity)
        }

        const removeBodyEntity = (body: p2.Body) => {
            const entity = bodyEntities.get(body)
            entity?.destroy()
        }

        const addSpringEntity = (spring: p2.Spring) => {
            const entity = ecs.world.create((e) => {
                e.add(PhysicsSpringComponent, spring)
            })

            springEntities.set(spring, entity)
        }

        const removeSpringRemoveSpringEntity = (spring: p2.Spring) => {
            const entity = springEntities.get(spring)
            entity?.destroy()
        }

        for (const body of world.bodies) {
            addBodyEntity(body)
        }

        for (const spring of world.springs) {
            addSpringEntity(spring)
        }

        // add physics body and spring entities on world events
        const addBodyHandler = ({ body }: { body: p2.Body }) => addBodyEntity(body)
        const removeBodyHandler = ({ body }: { body: p2.Body }) => removeBodyEntity(body)

        const addSpringHandler = ({ spring }: { spring: p2.Spring }) => addSpringEntity(spring)
        const removeSpringHandler = ({ spring }: { spring: p2.Spring }) => removeSpringRemoveSpringEntity(spring)

        world.on('addBody', addBodyHandler)
        world.on('addSpring', addSpringHandler)
        world.on('removeBody', removeBodyHandler)
        world.on('removeSpring', removeSpringHandler)

        // set the sandbox update handlers
        setSandboxUpdateHandlers(updateHandlers)

        // create singleton physics entity
        const physicsEntity = ecs.world.create()
        physicsEntity.add(PhysicsWorldComponent, world)

        // set window globals
        const globalWindow = window as unknown as Record<string, unknown>
        globalWindow.world = world
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext

        return () => {
            previousScene.current = scene

            setSandboxUpdateHandlers(undefined)

            world.off('addBody', addBodyHandler)
            world.off('addSpring', addSpringHandler)
            world.off('removeBody', removeBodyHandler)
            world.off('removeSpring', removeSpringHandler)

            destroySandbox()

            const entities = [
                physicsEntity,
                ...ecs.world.query([PhysicsBodyComponent]),
                ...ecs.world.query([PhysicsSpringComponent]),
            ]

            entities.forEach((entity) => {
                entity.destroy()
            })
        }
    }, [pixi, pointer?.id, scene, sceneVersion])

    useFrame((delta) => {
        ecs.update(delta)

        if (!sandboxUpdateHandlers) return
        sandboxUpdateHandlers.forEach((fn) => fn(delta))
    })

    return (
        <>
            <SandboxContainer ref={sandboxContainerRef} tabIndex={0}>
                {showHeader && (
                    <Header>
                        <a href="https://p2-es.pmnd.rs" target="_blank">
                            <ExternalLink>
                                p2-es
                                <ExternalLinkSvg />
                            </ExternalLink>
                        </a>

                        <HeaderMiddle>
                            <HeaderSandboxTitle>
                                {title}
                                {title && sceneNames.length > 1 ? ' - ' : ''}
                                {scene !== 'default' ? scene : ''}
                            </HeaderSandboxTitle>

                            <HeaderButtons>
                                <HeaderButton title="Reset">
                                    <button onClick={() => resetScene()}>
                                        <RefreshSvg />
                                    </button>
                                </HeaderButton>

                                <HeaderButton title="Settings">
                                    <button onClick={() => setShowControls((current) => !current)}>
                                        <PencilSvg />
                                    </button>
                                </HeaderButton>

                                {codeLink !== undefined ? (
                                    <HeaderButton title="Sandbox Source Code">
                                        <a href={codeLink} target="_blank">
                                            <CodeSvg />
                                        </a>
                                    </HeaderButton>
                                ) : null}
                            </HeaderButtons>
                        </HeaderMiddle>

                        <a href="https://p2-es.pmnd.rs/docs" target="_blank">
                            <ExternalLink>
                                docs
                                <ExternalLinkSvg />
                            </ExternalLink>
                        </a>
                    </Header>
                )}
                <Main>
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

            <ecs.Entity>
                <ecs.Component type={SettingsComponent} args={[sandboxSettings]} />
            </ecs.Entity>
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
