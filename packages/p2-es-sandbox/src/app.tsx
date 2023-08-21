import { Entity } from 'arancini'
import * as p2 from 'p2-es'
import { Body, Spring } from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { Controls } from './controls'
import {
    AppComponent,
    Loop,
    PhysicsBodyComponent,
    PhysicsSpringComponent,
    PhysicsWorldComponent,
    PixiComponent,
    PointerComponent,
    STAGES,
    SandboxSettings,
    SettingsComponent,
    defaultSandboxSettings,
    ecs,
    useFrame,
    useSingletonComponent,
} from './ecs'
import { useConst } from './hooks'
import { PhysicsAABBRenderer, PhysicsBodyRenderer, PhysicsContactRenderer, PhysicsSpringRenderer, initPixi } from './pixi'
import { PointerObserver } from './pointer-observer'
import { SandboxFunction, Scenes, createSandbox } from './sandbox'
import { CircleTool, PickPanTool, PolygonTool, RectangleTool, Tool, Tools } from './tools'
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
    Wrapper,
    styledComponentsTheme,
} from './ui'

const CONSOLE_MESSAGE = `
=== p2-es ===
Welcome to the p2-es sandbox environment!
Did you know you can interact with the physics world here in the console? Try executing the following:

/* set world gravity */
world.gravity[1] = 10;

/* add a body */
const body = new p2.Body({
    mass: 1,
});

body.addShape(new p2.Circle({
    radius: 1,
}));

world.addBody(body);
`

export type AppProps = {
    setup: SandboxFunction | Scenes
    title?: string
    codeLink?: string
}

const AppInner = ({ title, setup, codeLink }: AppProps) => {
    const appWrapperElement = useRef<HTMLDivElement>(null)
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

    /* controls visibility, initially set by url search params */
    const [searchParams] = useState(() => new URLSearchParams(window.location.search))
    const [controlsHidden, setControlsHidden] = useState(() => {
        return searchParams.get('controls') === 'false'
    })

    const [sandboxSettings, setSandboxSettings] = useState<SandboxSettings>(defaultSandboxSettings)

    /* user-land handlers */
    const [sandboxUpdateHandlers, setSandboxUpdateHandlers] = useState<Set<(delta: number) => void> | undefined>()

    const bodyEntities: Map<Body, Entity> = useConst(() => new Map())
    const springEntities: Map<Spring, Entity> = useConst(() => new Map())

    const pixi = useSingletonComponent(PixiComponent)
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pointer = useSingletonComponent(PointerComponent)
    const settings = useSingletonComponent(SettingsComponent)

    useEffect(() => {
        pixi?.onResize()
    }, [pixi, controlsHidden])

    useEffect(() => {
        const { destroyPixi, ...pixiObjects } = initPixi(canvasWrapperElement.current!)

        const pixiEntity = ecs.world.create()
        pixiEntity.add(PixiComponent, pixiObjects)

        console.log(CONSOLE_MESSAGE)

        return () => {
            pixiEntity.destroy()
            destroyPixi()
        }
    }, [])

    useEffect(() => {
        const appEntity = ecs.world.create()
        appEntity.add(AppComponent, appWrapperElement.current!)

        appWrapperElement.current!.focus()

        return () => {
            appEntity.destroy()
        }
    }, [])

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

        // set sandbox settings if the scene has changed
        if (scene !== previousScene.current) {
            const s = {
                ...defaultSandboxSettings,
                ...newSandboxSettings,
            }
            setSandboxSettings(s)
        }

        if (tools?.default) {
            setTool(tools.default)
        }

        // create entities for existing physics bodies and springs
        const addBodyEntity = (body: Body) => {
            const entity = ecs.world.create((e) => {
                e.add(PhysicsBodyComponent, body)
            })

            bodyEntities.set(body, entity)
        }

        const removeBodyEntity = (body: Body) => {
            const entity = bodyEntities.get(body)
            entity?.destroy()
        }

        const addSpringEntity = (spring: Spring) => {
            const entity = ecs.world.create((e) => {
                e.add(PhysicsSpringComponent, spring)
            })

            springEntities.set(spring, entity)
        }

        const removeSpringRemoveSpringEntity = (spring: Spring) => {
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
        const addBodyHandler = ({ body }: { body: Body }) => addBodyEntity(body)
        const removeBodyHandler = ({ body }: { body: Body }) => removeBodyEntity(body)

        const addSpringHandler = ({ spring }: { spring: Spring }) => addSpringEntity(spring)
        const removeSpringHandler = ({ spring }: { spring: Spring }) => removeSpringRemoveSpringEntity(spring)

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
        if (!settings || !physicsWorld) return

        const { physicsStepsPerSecond, maxSubSteps, paused } = settings

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        physicsWorld.step(1 / physicsStepsPerSecond, clampedDelta, maxSubSteps)
    }, STAGES.PHYSICS)

    useFrame((delta) => {
        if (!sandboxUpdateHandlers) return

        sandboxUpdateHandlers.forEach((fn) => fn(delta))
    }, STAGES.SANDBOX_HANDLERS)

    const shapeToolProps = {
        newShapeCollisionMask: settings?.newShapeCollisionMask,
        newShapeCollisionGroup: settings?.newShapeCollisionGroup,
    }

    return (
        <>
            <Wrapper ref={appWrapperElement} tabIndex={0}>
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
                                <button onClick={() => setControlsHidden((current) => !current)}>
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
                <Main>
                    <CanvasWrapper ref={canvasWrapperElement} settingsHidden={controlsHidden} />

                    <ControlsWrapper hide={controlsHidden}>
                        <Controls
                            hidden={controlsHidden}
                            tool={tool}
                            setTool={(t) => setTool(t)}
                            scene={scene}
                            scenes={sceneNames}
                            setScene={(sceneName) => setScene(sceneName)}
                            settings={sandboxSettings}
                            setSettings={setSandboxSettings}
                            reset={resetScene}
                        />
                    </ControlsWrapper>
                </Main>
            </Wrapper>

            <PointerObserver />
            {tool === Tools.PICK_PAN && <PickPanTool />}
            {tool === Tools.POLYGON && <PolygonTool {...shapeToolProps} />}
            {tool === Tools.CIRCLE && <CircleTool {...shapeToolProps} />}
            {tool === Tools.RECTANGLE && <RectangleTool {...shapeToolProps} />}

            <PhysicsBodyRenderer />
            <PhysicsContactRenderer />
            <PhysicsSpringRenderer />
            <PhysicsAABBRenderer />

            <ecs.Entity>
                <ecs.Component type={SettingsComponent} args={[sandboxSettings]} />
            </ecs.Entity>

            <Loop />
        </>
    )
}

export const App = (props: AppProps) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={styledComponentsTheme}>
                <AppInner {...props} />
            </ThemeProvider>
        </React.StrictMode>
    )
}
