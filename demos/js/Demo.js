import * as PIXI from '../../demos/js/pixi.min.mjs'
import * as p2 from '../../dist/p2-es.js'
import * as dat from './dat.gui.module.js'

export class Demo extends p2.EventEmitter {
    get drawContacts() {
        return this.settings['drawContacts [c]']
    }

    set drawContacts(value) {
        this.settings['drawContacts [c]'] = value
        this.updateGUI()
    }

    get drawAABBs() {
        return this.settings['drawAABBs [t]']
    }

    set drawAABBs(value) {
        this.settings['drawAABBs [t]'] = value
        this.updateGUI()
    }

    get paused() {
        return this.settings['paused [p]']
    }

    set paused(value) {
        this.resetCallTime = true
        this.settings['paused [p]'] = value
        this.updateGUI()
    }

    constructor(scenes, options) {
        super()

        this.options = options || {}

        // Expose app and p2 in window
        window.app = this
        window.p2 = p2
        window.PIXI = PIXI

        // Get input scenes
        if (scenes.setup) {
            // Only one scene given, without name
            this.scenes = {
                default: scenes,
            }
        } else if (typeof scenes === 'function') {
            this.scenes = {
                default: {
                    setup: scenes,
                },
            }
        }

        const settings = {
            lineWidth: 0.01,
            scrollFactor: 0.1,
            width: 1280, // Pixi screen resolution
            height: 720,
            useDeviceAspect: false,
            sleepOpacity: 0.2,
        }

        for (const key of Object.keys(this.options)) {
            settings[key] = this.options[key]
        }

        if (settings.useDeviceAspect) {
            settings.height = window.innerHeight / (window.innerWidth * settings.width)
        }

        this.lineWidth = settings.lineWidth
        this.scrollFactor = settings.scrollFactor
        this.sleepOpacity = settings.sleepOpacity

        this.sprites = []
        this.springSprites = []
        this.debugPolygons = false

        this.islandColors = {} // id -> int

        this.state = Demo.DEFAULT

        this.bodies = []
        this.springs = []
        this.timeStep = 1 / 60
        this.relaxation = p2.Equation.DEFAULT_RELAXATION
        this.stiffness = p2.Equation.DEFAULT_STIFFNESS

        this.mouseConstraint = null
        this.nullBody = new p2.Body()
        this.pickPrecision = 5

        this.useInterpolatedPositions = true

        this.drawPoints = []
        this.drawPointsChangeEvent = { type: 'drawPointsChange' }
        this.drawCircleCenter = p2.vec2.create()
        this.drawCirclePoint = p2.vec2.create()
        this.drawCircleChangeEvent = { type: 'drawCircleChange' }
        this.drawRectangleChangeEvent = { type: 'drawRectangleChange' }
        this.drawRectStart = p2.vec2.create()
        this.drawRectEnd = p2.vec2.create()

        this.stateChangeEvent = { type: 'stateChange', state: null }

        this.mousePosition = p2.vec2.create()

        // Default collision masks for new shapes
        this.newShapeCollisionMask = 1
        this.newShapeCollisionGroup = 1

        // If constraints should be drawn
        this.drawConstraints = false

        this.stats_sum = 0
        this.stats_N = 100
        this.stats_Nsummed = 0
        this.stats_average = -1

        this.addedGlobals = []

        this.settings = {
            tool: Demo.DEFAULT,
            fullscreen() {
                const el = document.body
                const requestFullscreen =
                    el.requestFullscreen ||
                    el.msRequestFullscreen ||
                    el.mozRequestFullScreen ||
                    el.webkitRequestFullscreen
                if (requestFullscreen) {
                    requestFullscreen.call(el)
                }
            },

            'paused [p]': false,
            'manualStep [s]': () => {
                this.world.step(this.world.lastTimeStep)
            },
            fps: 60,
            maxSubSteps: 3,
            gravityX: 0,
            gravityY: -10,
            sleepMode: p2.World.NO_SLEEPING,

            'drawContacts [c]': false,
            'drawAABBs [t]': false,
            drawConstraints: false,

            iterations: 10,
            stiffness: 1000000,
            relaxation: 4,
            tolerance: 0.0001,
        }

        this.init()
        this.resizeToFit()
        this.render()
        this.createStats()
        this.addLogo()
        this.centerCamera(0, 0)

        window.onresize = () => {
            this.resizeToFit()

            if (this.background) {
                this.resizeBackground()
            }
        }

        this.setUpKeyboard()
        this.setupGUI()

        if (typeof this.options.hideGUI === 'undefined') {
            this.options.hideGUI = 'auto'
        }
        if ((this.options.hideGUI === 'auto' && window.innerWidth < 600) || this.options.hideGUI === true) {
            this.gui.close()
        }

        this.printConsoleMessage()

        for (const key in settings) {
            this.settings[key] = settings[key]
        }

        this.pickPrecision = 0.1

        // Update "ghost draw line"
        this.on('drawPointsChange', () => {
            const g = this.drawShapeGraphics
            const path = this.drawPoints

            g.clear()

            const path2 = []
            for (let j = 0; j < path.length; j++) {
                const v = path[j]
                path2.push([v[0], v[1]])
            }

            this.drawPath(g, path2, 0xff0000, false, this.lineWidth, false)
        })

        // Update draw circle
        this.on('drawCircleChange', () => {
            const g = this.drawShapeGraphics
            g.clear()
            const center = this.drawCircleCenter
            const R = p2.vec2.distance(center, this.drawCirclePoint)
            this.drawCircle(g, center[0], center[1], 0, R, false, this.lineWidth)
        })

        // Update draw circle
        this.on('drawRectangleChange', () => {
            const g = this.drawShapeGraphics
            g.clear()
            const start = this.drawRectStart
            const end = this.drawRectEnd
            const width = start[0] - end[0]
            const height = start[1] - end[1]
            this.drawRectangle(
                g,
                start[0] - width / 2,
                start[1] - height / 2,
                0,
                width,
                height,
                false,
                false,
                this.lineWidth,
                false
            )
        })

        // Set first scene
        this.setSceneByIndex(0)

        // Start rendering
        this.startRenderingLoop()
    }

    /**
     * Initialize the pixi.js application
     */
    init() {
        const s = this.settings

        PIXI.GRAPHICS_CURVES.minSegments = 20
        this.renderer = PIXI.autoDetectRenderer({
            width: s.width,
            height: s.height,
            backgroundColor: 0xffffff,
            antialias: true,
        })
        this.stage = new PIXI.Container()
        this.stage.interactive = true

        this.container = new PIXI.Container()

        const el = (this.element = this.renderer.view)
        el.tabIndex = 1
        el.classList.add(Demo.elementClass)
        el.setAttribute('style', 'width:100%;')

        const div = (this.elementContainer = document.createElement('div'))
        div.classList.add(Demo.containerClass)
        div.setAttribute('style', 'width:100%; height:100%')
        div.appendChild(el)
        document.body.appendChild(div)
        el.focus()
        el.oncontextmenu = () => false

        // Background, needed for the entire canvas to support mouse events
        this.background = new PIXI.Graphics()
        this.stage.addChild(this.background)

        // Graphics object for drawing shapes
        this.drawShapeGraphics = new PIXI.Graphics()
        this.container.addChild(this.drawShapeGraphics)

        // Graphics object for contacts
        this.contactGraphics = new PIXI.Graphics()
        this.container.addChild(this.contactGraphics)

        // Graphics object for AABBs
        this.aabbGraphics = new PIXI.Graphics()
        this.container.addChild(this.aabbGraphics)

        // Graphics object for pick
        this.pickGraphics = new PIXI.Graphics()
        this.container.addChild(this.pickGraphics)

        this.container.scale.x = 200
        this.container.scale.y = -200 // Flip Y direction.

        this.stage.addChild(this.container)

        let lastX
        let lastY
        let lastMoveX
        let lastMoveY
        let startX
        let startY
        let down = false

        const physicsPosA = p2.vec2.create()
        const physicsPosB = p2.vec2.create()
        const stagePos = p2.vec2.create()
        let initPinchLength = 0
        const initScaleX = 1
        const initScaleY = 1
        let lastNumTouches = 0

        this.stage.mousedown = this.stage.touchstart = (e) => {
            lastMoveX = e.data.global.x
            lastMoveY = e.data.global.y

            if (e.data.touches) {
                lastNumTouches = e.data.touches.length
            }

            if (e.data.touches && e.data.touches.length === 2) {
                const touchA = this.container.interactionManager.touchs[0]
                const touchB = this.container.interactionManager.touchs[1]

                let pos = touchA.getLocalPosition(this.container) // todo - was `stage`
                p2.vec2.set(stagePos, pos.x, pos.y)
                this.stagePositionToPhysics(physicsPosA, stagePos)

                pos = touchB.getLocalPosition(this.container)
                p2.vec2.set(stagePos, pos.x, pos.y)
                this.stagePositionToPhysics(physicsPosB, stagePos)

                initPinchLength = p2.vec2.distance(physicsPosA, physicsPosB)

                return
            }

            lastX = e.data.global.x
            lastY = e.data.global.y
            startX = this.container.position.x
            startY = this.container.position.y
            down = true

            this.lastMousePos = e.data.global

            const pos = e.data.getLocalPosition(this.container)
            p2.vec2.set(init_containerPosition, pos.x, pos.y)
            this.stagePositionToPhysics(init_physicsPosition, init_containerPosition)
            this.handleMouseDown(init_physicsPosition)
        }

        this.stage.mousemove = this.stage.touchmove = (e) => {
            if (e.data.touches) {
                if (lastNumTouches !== e.data.touches.length) {
                    lastX = e.data.global.x
                    lastY = e.data.global.y
                    startX = this.stage.position.x
                    startY = this.stage.position.y
                }

                lastNumTouches = e.data.touches.length
            }

            lastMoveX = e.data.global.x
            lastMoveY = e.data.global.y

            if (e.data.touches && e.data.touches.length === 2) {
                const touchA = this.stage.interactionManager.touchs[0]
                const touchB = this.stage.interactionManager.touchs[1]

                let pos = touchA.getLocalPosition(this.stage)
                p2.vec2.set(stagePos, pos.x, pos.y)
                this.stagePositionToPhysics(physicsPosA, stagePos)

                pos = touchB.getLocalPosition(this.stage)
                p2.vec2.set(stagePos, pos.x, pos.y)
                this.stagePositionToPhysics(physicsPosB, stagePos)

                const pinchLength = p2.vec2.distance(physicsPosA, physicsPosB)

                // Get center
                p2.vec2.add(physicsPosA, physicsPosA, physicsPosB)
                p2.vec2.scale(physicsPosA, physicsPosA, 0.5)
                this.zoom(
                    (touchA.global.x + touchB.global.x) * 0.5,
                    (touchA.global.y + touchB.global.y) * 0.5,
                    null,
                    (pinchLength / initPinchLength) * initScaleX, // zoom relative to the initial scale
                    (pinchLength / initPinchLength) * initScaleY
                )

                return
            }

            if (down && this.state === Demo.PANNING) {
                this.container.position.x = e.data.global.x - lastX + startX
                this.container.position.y = e.data.global.y - lastY + startY
            }

            this.lastMousePos = e.data.global

            const pos = e.data.getLocalPosition(this.container)
            p2.vec2.set(init_containerPosition, pos.x, pos.y)
            this.stagePositionToPhysics(init_physicsPosition, init_containerPosition)
            this.handleMouseMove(init_physicsPosition)
        }

        this.stage.mouseup = this.stage.touchend = (e) => {
            if (e.data.touches) {
                lastNumTouches = e.data.touches.length
            }

            down = false
            lastMoveX = e.data.global.x
            lastMoveY = e.data.global.y

            this.lastMousePos = e.global

            const pos = e.data.getLocalPosition(this.container)
            p2.vec2.set(init_containerPosition, pos.x, pos.y)
            this.stagePositionToPhysics(init_physicsPosition, init_containerPosition)
            this.handleMouseUp(init_physicsPosition)
        }

        // http://stackoverflow.com/questions/7691551/touchend-event-in-ios-webkit-not-firing
        this.element.ontouchmove = (e) => {
            e.preventDefault()
        }

        const MouseWheelHandler = (e) => {
            // cross-browser wheel delta
            e = window.event || e // old IE support
            // var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            const o = e
            let d = o.detail
            const w = o.wheelDelta
            const n = 225
            const n1 = n - 1

            // Normalize delta: http://stackoverflow.com/a/13650579/2285811
            let f
            d = d ? (w && (f = w / d) ? d / f : -d / 1.35) : w / 120
            // Quadratic scale if |d| > 1
            d = d < 1 ? (d < -1 ? (-(d ** 2) - n1) / n : d) : (d ** 2 + n1) / n
            // Delta *should* not be greater than 2...
            const delta = Math.min(Math.max(d / 2, -1), 1)

            const out = delta >= 0
            if (typeof lastMoveX !== 'undefined') {
                this.zoom(lastMoveX, lastMoveY, out, undefined, undefined, delta)
            }
        }

        if (el.addEventListener) {
            el.addEventListener('mousewheel', MouseWheelHandler, false) // IE9, Chrome, Safari, Opera
            el.addEventListener('DOMMouseScroll', MouseWheelHandler, false) // Firefox
        } else {
            el.attachEvent('onmousewheel', MouseWheelHandler) // IE 6/7/8
        }

        this.centerCamera(0, 0)
    }

    /**
     * Sets up dat.gui
     */
    setupGUI() {
        if (typeof dat === 'undefined') {
            return
        }

        const gui = (this.gui = new dat.GUI())
        gui.domElement.setAttribute('style', disableSelectionCSS.join(';'))

        const settings = this.settings

        gui.add(settings, 'tool', Demo.toolStateMap).onChange((state) => {
            this.setState(parseInt(state, 10))
        })
        gui.add(settings, 'fullscreen')

        // World folder
        const worldFolder = gui.addFolder('World')
        worldFolder.open()
        worldFolder.add(settings, 'paused [p]').onChange((p) => {
            this.paused = p
        })
        worldFolder.add(settings, 'manualStep [s]')
        worldFolder
            .add(settings, 'fps', 10, 60 * 10)
            .step(10)
            .onChange((freq) => {
                this.timeStep = 1 / freq
            })
        worldFolder.add(settings, 'maxSubSteps', 0, 10).step(1)
        const maxg = 100

        const changeGravity = () => {
            if (!Number.isNaN(settings.gravityX) && !Number.isNaN(settings.gravityY)) {
                p2.vec2.set(this.world.gravity, settings.gravityX, settings.gravityY)
            }
        }
        worldFolder.add(settings, 'gravityX', -maxg, maxg).onChange(changeGravity)
        worldFolder.add(settings, 'gravityY', -maxg, maxg).onChange(changeGravity)
        worldFolder
            .add(settings, 'sleepMode', {
                NO_SLEEPING: p2.World.NO_SLEEPING,
                BODY_SLEEPING: p2.World.BODY_SLEEPING,
                ISLAND_SLEEPING: p2.World.ISLAND_SLEEPING,
            })
            .onChange((mode) => {
                this.world.sleepMode = parseInt(mode, 10)
            })

        // Rendering
        const renderingFolder = gui.addFolder('Rendering')
        renderingFolder.open()
        renderingFolder.add(settings, 'drawContacts [c]').onChange((draw) => {
            this.drawContacts = draw
        })
        renderingFolder.add(settings, 'drawAABBs [t]').onChange((draw) => {
            this.drawAABBs = draw
        })

        // Solver
        const solverFolder = gui.addFolder('Solver')
        solverFolder.open()
        solverFolder
            .add(settings, 'iterations', 1, 100)
            .step(1)
            .onChange((it) => {
                this.world.solver.iterations = it
            })
        solverFolder.add(settings, 'stiffness', 10).onChange(() => {
            this.updateEquationParameters()
        })
        solverFolder
            .add(settings, 'relaxation', 0, 20)
            .step(0.1)
            .onChange(() => {
                this.updateEquationParameters()
            })
        solverFolder
            .add(settings, 'tolerance', 0, 10)
            .step(0.01)
            .onChange((t) => {
                this.world.solver.tolerance = t
            })

        // Scene picker
        const sceneFolder = gui.addFolder('Scenes')
        sceneFolder.open()

        // Add scenes
        let i = 1
        for (const sceneName of Object.keys(this.scenes)) {
            const guiLabel = `${sceneName} [${i++}]`
            this.settings[guiLabel] = () => {
                this.setScene(this.scenes[sceneName])
            }
            sceneFolder.add(settings, guiLabel)
        }
    }

    /**
     * Updates dat.gui. Call whenever you change demo.settings.
     */
    updateGUI() {
        if (!this.gui) {
            return
        }

        const updateControllers = (folder) => {
            // First level
            for (const controller of folder.__controllers) {
                controller.updateDisplay()
            }

            // Second level
            for (const f of Object.values(folder.__folders)) {
                updateControllers(f)
            }
        }
        updateControllers(this.gui)
    }

    setWorld(world) {
        this.world = world

        window.world = world // For debugging.

        world
            .on('postStep', () => {
                this.updateStats()
            })
            .on('addBody', (e) => {
                this.addVisual(e.body)
            })
            .on('removeBody', (e) => {
                this.removeVisual(e.body)
            })
            .on('addSpring', (e) => {
                this.addVisual(e.spring)
            })
            .on('removeSpring', (e) => {
                this.removeVisual(e.spring)
            })
    }

    /**
     * Sets the current scene to the scene definition given.
     * @param {object} sceneDefinition
     * @param {function} sceneDefinition.setup
     * @param {function} [sceneDefinition.teardown]
     */
    setScene(sceneDefinition) {
        if (typeof sceneDefinition === 'string') {
            sceneDefinition = this.scenes[sceneDefinition]
        }

        this.removeAllVisuals()
        if (this.currentScene && this.currentScene.teardown) {
            this.currentScene.teardown()
        }
        if (this.world) {
            this.world.clear()
        }

        for (let i = 0; i < this.addedGlobals.length; i++) {
            delete window[this.addedGlobals]
        }

        const preGlobalVars = Object.keys(window)

        this.currentScene = sceneDefinition
        this.world = null
        sceneDefinition.setup.call(this)
        if (!this.world) {
            throw new Error('The .setup function in the scene definition must run this.setWorld(world);')
        }

        const postGlobalVars = Object.keys(window)
        const added = []
        for (let i = 0; i < postGlobalVars.length; i++) {
            if (preGlobalVars.indexOf(postGlobalVars[i]) === -1 && postGlobalVars[i] !== 'world') {
                added.push(postGlobalVars[i])
            }
        }
        if (added.length) {
            added.sort()
            console.log(
                [
                    'The following variables were exposed globally from this physics scene.',
                    '',
                    `  ${added.join(', ')}`,
                    '',
                ].join('\n')
            )
        }

        this.addedGlobals = added

        // Set the GUI parameters from the loaded world
        const settings = this.settings
        settings.iterations = this.world.solver.iterations
        settings.tolerance = this.world.solver.tolerance
        settings.gravityX = this.world.gravity[0]
        settings.gravityY = this.world.gravity[1]
        settings.sleepMode = this.world.sleepMode
        this.updateGUI()
    }

    /**
     * Set scene by its position in which it was given. Starts at 0.
     * @param {number} index
     */
    setSceneByIndex(index) {
        let i = 0
        for (const key in this.scenes) {
            if (i === index) {
                this.setScene(this.scenes[key])
                break
            }
            i++
        }
    }

    /**
     * Adds all needed keyboard callbacks
     */
    setUpKeyboard() {
        this.elementContainer.onkeydown = (e) => {
            if (!e.keyCode) {
                return
            }
            let s = this.state
            const ch = String.fromCharCode(e.keyCode)
            switch (ch) {
                case 'P': // pause
                    this.paused = !this.paused
                    break
                case 'S': // step
                    this.world.step(this.world.lastTimeStep)
                    break
                case 'R': // restart
                    this.setScene(this.currentScene)
                    break
                case 'C': // toggle draw contacts & constraints
                    this.drawContacts = !this.drawContacts
                    this.drawConstraints = !this.drawConstraints
                    break
                case 'T': // toggle draw AABBs
                    this.drawAABBs = !this.drawAABBs
                    break
                case 'D': // toggle draw polygon mode
                    this.setState(s === Demo.DRAWPOLYGON ? Demo.DEFAULT : (s = Demo.DRAWPOLYGON))
                    break
                case 'A': // toggle draw circle mode
                    this.setState(s === Demo.DRAWCIRCLE ? Demo.DEFAULT : (s = Demo.DRAWCIRCLE))
                    break
                case 'F': // toggle draw rectangle mode
                    this.setState(s === Demo.DRAWRECTANGLE ? Demo.DEFAULT : (s = Demo.DRAWRECTANGLE))
                    break
                case 'Q': // set default
                    this.setState(Demo.DEFAULT)
                    break
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.setSceneByIndex(parseInt(ch, 10) - 1)
                    break
                default:
                    Demo.keydownEvent.keyCode = e.keyCode
                    Demo.keydownEvent.originalEvent = e
                    this.emit(Demo.keydownEvent)
                    break
            }
            this.updateGUI()
        }

        this.elementContainer.onkeyup = (e) => {
            if (e.keyCode) {
                switch (String.fromCharCode(e.keyCode)) {
                    default:
                        Demo.keyupEvent.keyCode = e.keyCode
                        Demo.keyupEvent.originalEvent = e
                        this.emit(Demo.keyupEvent)
                        break
                }
            }
        }
    }

    /**
     * Start the rendering loop
     */
    startRenderingLoop() {
        const demo = this
        let lastCallTime = Date.now() / 1000

        const update = () => {
            if (!demo.paused) {
                const now = Date.now() / 1000
                let timeSinceLastCall = now - lastCallTime
                if (demo.resetCallTime) {
                    timeSinceLastCall = 0
                    demo.resetCallTime = false
                }
                lastCallTime = now

                // Cap if we have a really large deltatime.
                // The requestAnimationFrame deltatime is usually below 0.0333s (30Hz) and on desktops it should be below 0.0166s.
                timeSinceLastCall = Math.min(timeSinceLastCall, 0.5)

                demo.world.step(demo.timeStep, timeSinceLastCall, demo.settings.maxSubSteps)
            }
            demo.render()
            requestAnimationFrame(update)
        }

        requestAnimationFrame(update)
        this.resizeBackground()
    }

    zoom(x, y, zoomOut, actualScaleX, actualScaleY, multiplier) {
        let { scrollFactor } = this
        const { container } = this

        if (typeof actualScaleX === 'undefined') {
            if (!zoomOut) {
                scrollFactor *= -1
            }

            scrollFactor *= Math.abs(multiplier)

            container.scale.x *= 1 + scrollFactor
            container.scale.y *= 1 + scrollFactor
            container.position.x += scrollFactor * (container.position.x - x)
            container.position.y += scrollFactor * (container.position.y - y)
        } else {
            container.scale.x *= actualScaleX
            container.scale.y *= actualScaleY
            container.position.x += (actualScaleX - 1) * (container.position.x - x)
            container.position.y += (actualScaleY - 1) * (container.position.y - y)
        }
    }

    centerCamera(x, y) {
        this.container.position.x = this.renderer.width / 2 - this.container.scale.x * x
        this.container.position.y = this.renderer.height / 2 - this.container.scale.y * y
    }

    stagePositionToPhysics(out, stagePosition) {
        const x = stagePosition[0]
        const y = stagePosition[1]
        p2.vec2.set(out, x, y)
        return out
    }

    frame(centerX, centerY, width, height) {
        const ratio = this.renderer.width / this.renderer.height
        if (ratio < width / height) {
            this.container.scale.x = this.renderer.width / width
            this.container.scale.y = -this.container.scale.x
        } else {
            this.container.scale.y = -this.renderer.height / height
            this.container.scale.x = -this.container.scale.y
        }
        this.centerCamera(centerX, centerY)
    }

    updateSpriteTransform(sprite, body) {
        if (this.useInterpolatedPositions && !this.paused) {
            sprite.position.x = body.interpolatedPosition[0]
            sprite.position.y = body.interpolatedPosition[1]
            sprite.rotation = body.interpolatedAngle
        } else {
            sprite.position.x = body.position[0]
            sprite.position.y = body.position[1]
            sprite.rotation = body.angle
        }
    }

    render() {
        const { springSprites } = this

        // Update body transforms
        for (let i = 0; i !== this.bodies.length; i++) {
            this.updateSpriteTransform(this.sprites[i], this.bodies[i])
        }

        // Update graphics if the body changed sleepState or island
        for (let i = 0; i !== this.bodies.length; i++) {
            const body = this.bodies[i]
            const isSleeping = body.sleepState === p2.Body.SLEEPING
            const sprite = this.sprites[i]
            const islandColor = this.getIslandColor(body)
            if (sprite.drawnSleeping !== isSleeping || sprite.drawnColor !== islandColor) {
                sprite.clear()
                this.drawRenderable(body, sprite, islandColor, sprite.drawnLineColor)
            }
        }

        // Update spring transforms
        for (let i = 0; i !== this.springs.length; i++) {
            const s = this.springs[i]
            const sprite = springSprites[i]
            const bA = s.bodyA
            const bB = s.bodyB

            if (this.useInterpolatedPositions && !this.paused) {
                p2.vec2.toGlobalFrame(worldAnchorA, s.localAnchorA, bA.interpolatedPosition, bA.interpolatedAngle)
                p2.vec2.toGlobalFrame(worldAnchorB, s.localAnchorB, bB.interpolatedPosition, bB.interpolatedAngle)
            } else {
                s.getWorldAnchorA(worldAnchorA)
                s.getWorldAnchorB(worldAnchorB)
            }

            sprite.scale.y = 1
            if (worldAnchorA[1] < worldAnchorB[1]) {
                const tmp = worldAnchorA
                worldAnchorA = worldAnchorB
                worldAnchorB = tmp
                sprite.scale.y = -1
            }

            const sxA = worldAnchorA[0]
            const syA = worldAnchorA[1]
            const sxB = worldAnchorB[0]
            const syB = worldAnchorB[1]

            // Spring position is the mean point between the anchors
            sprite.position.x = (sxA + sxB) / 2
            sprite.position.y = (syA + syB) / 2

            // Compute distance vector between anchors, in screen coords
            distVec[0] = sxA - sxB
            distVec[1] = syA - syB

            // Compute angle
            sprite.rotation = Math.acos(p2.vec2.dot(X, distVec) / p2.vec2.length(distVec))

            // And scale
            sprite.scale.x = p2.vec2.length(distVec) / s.restLength
        }

        // Clear contacts
        if (this.drawContacts) {
            this.contactGraphics.clear()
            this.container.removeChild(this.contactGraphics)
            this.container.addChild(this.contactGraphics)

            const g = this.contactGraphics
            g.lineStyle(this.lineWidth, 0x000000, 1)
            for (let i = 0; i !== this.world.narrowphase.contactEquations.length; i++) {
                const eq = this.world.narrowphase.contactEquations[i]
                const bi = eq.bodyA
                const bj = eq.bodyB
                const ri = eq.contactPointA
                const rj = eq.contactPointB
                const xi = bi.position[0]
                const yi = bi.position[1]
                const xj = bj.position[0]
                const yj = bj.position[1]

                g.moveTo(xi, yi)
                g.lineTo(xi + ri[0], yi + ri[1])

                g.moveTo(xj, yj)
                g.lineTo(xj + rj[0], yj + rj[1])
            }
            this.contactGraphics.cleared = false
        } else if (!this.contactGraphics.cleared) {
            this.contactGraphics.clear()
            this.contactGraphics.cleared = true
        }

        // Draw AABBs
        if (this.drawAABBs) {
            this.aabbGraphics.clear()
            this.container.removeChild(this.aabbGraphics)
            this.container.addChild(this.aabbGraphics)
            const g = this.aabbGraphics
            g.lineStyle(this.lineWidth, 0x000000, 1)

            for (let i = 0; i !== this.world.bodies.length; i++) {
                const aabb = this.world.bodies[i].getAABB()
                g.drawRect(
                    aabb.lowerBound[0],
                    aabb.lowerBound[1],
                    aabb.upperBound[0] - aabb.lowerBound[0],
                    aabb.upperBound[1] - aabb.lowerBound[1]
                )
            }
            this.aabbGraphics.cleared = false
        } else if (!this.aabbGraphics.cleared) {
            this.aabbGraphics.clear()
            this.aabbGraphics.cleared = true
        }

        // Draw pick line
        if (this.mouseConstraint) {
            const g = this.pickGraphics
            g.clear()
            this.container.removeChild(g)
            this.container.addChild(g)
            g.lineStyle(this.lineWidth, 0x000000, 1)
            const c = this.mouseConstraint
            const worldPivotB = p2.vec2.create()
            c.bodyB.toWorldFrame(worldPivotB, c.pivotB)
            g.moveTo(c.pivotA[0], c.pivotA[1])
            g.lineTo(worldPivotB[0], worldPivotB[1])
            g.cleared = false
        } else if (!this.pickGraphics.cleared) {
            this.pickGraphics.clear()
            this.pickGraphics.cleared = true
        }

        if (this.followBody) {
            this.centerCamera(this.followBody.interpolatedPosition[0], this.followBody.interpolatedPosition[1])
        }

        this.renderer.render(this.stage)
    }

    drawRenderable(obj, graphics, color, lineColor) {
        const lw = this.lineWidth

        graphics.drawnSleeping = false
        graphics.drawnColor = color
        graphics.drawnLineColor = lineColor
        if (obj instanceof p2.Body && obj.shapes.length) {
            const isSleeping = obj.sleepState === p2.Body.SLEEPING
            graphics.drawnSleeping = isSleeping

            if (obj.concavePath && !this.debugPolygons) {
                const path = []
                for (let j = 0; j !== obj.concavePath.length; j++) {
                    const v = obj.concavePath[j]
                    path.push([v[0], v[1]])
                }
                this.drawPath(graphics, path, lineColor, color, lw, isSleeping)
            } else {
                for (let i = 0; i < obj.shapes.length; i++) {
                    const child = obj.shapes[i]
                    const offset = child.position
                    const { angle } = child

                    if (child instanceof p2.Circle) {
                        this.drawCircle(graphics, offset[0], offset[1], angle, child.radius, color, lw, isSleeping)
                    } else if (child instanceof p2.Particle) {
                        this.drawCircle(graphics, offset[0], offset[1], angle, 2 * lw, lineColor, 0)
                    } else if (child instanceof p2.Plane) {
                        // TODO use shape angle
                        this.drawPlane(graphics, -10, 10, color, lineColor, lw, lw * 10, lw * 10, 100)
                    } else if (child instanceof p2.Line) {
                        this.drawLine(graphics, offset, angle, child.length, lineColor, lw)
                    } else if (child instanceof p2.Box) {
                        this.drawRectangle(
                            graphics,
                            offset[0],
                            offset[1],
                            angle,
                            child.width,
                            child.height,
                            lineColor,
                            color,
                            lw,
                            isSleeping
                        )
                    } else if (child instanceof p2.Capsule) {
                        this.drawCapsule(
                            graphics,
                            offset[0],
                            offset[1],
                            angle,
                            child.length,
                            child.radius,
                            lineColor,
                            color,
                            lw,
                            isSleeping
                        )
                    } else if (child instanceof p2.Convex) {
                        // Scale verts
                        const verts = []
                        const vrot = p2.vec2.create()
                        for (let j = 0; j !== child.vertices.length; j++) {
                            const v = child.vertices[j]
                            p2.vec2.rotate(vrot, v, angle)
                            verts.push([vrot[0] + offset[0], vrot[1] + offset[1]])
                        }
                        this.drawConvex(
                            graphics,
                            verts,
                            child.triangles,
                            lineColor,
                            color,
                            lw,
                            this.debugPolygons,
                            offset,
                            isSleeping
                        )
                    } else if (child instanceof p2.Heightfield) {
                        const path = [[0, -100]]
                        for (let j = 0; j !== child.heights.length; j++) {
                            const v = child.heights[j]
                            path.push([j * child.elementWidth, v])
                        }
                        path.push([child.heights.length * child.elementWidth, -100])
                        this.drawPath(graphics, path, lineColor, color, lw, isSleeping)
                    }
                }
            }
        } else if (obj instanceof p2.Spring) {
            const restLengthPixels = obj.restLength
            this.drawSpring(graphics, restLengthPixels, 0x000000, lw)
        }
    }

    getIslandColor(body) {
        const { islandColors } = this
        if (body.islandId === -1) {
            return 0xdddddd // Gray for static objects
        }
        if (islandColors[body.islandId]) {
            return islandColors[body.islandId]
        }
        const color = parseInt(randomPastelHex(), 16)
        islandColors[body.islandId] = color
        return color
    }

    addRenderable(obj) {
        // Random color
        const lineColor = 0x000000

        const sprite = new PIXI.Graphics()
        if (obj instanceof p2.Body && obj.shapes.length) {
            const color = this.getIslandColor(obj)
            this.drawRenderable(obj, sprite, color, lineColor)
            this.sprites.push(sprite)
            this.container.addChild(sprite)
        } else if (obj instanceof p2.Spring) {
            this.drawRenderable(obj, sprite, 0x000000, lineColor)
            this.springSprites.push(sprite)
            this.container.addChild(sprite)
        }
    }

    removeRenderable(obj) {
        if (obj instanceof p2.Body) {
            const i = this.bodies.indexOf(obj)
            if (i !== -1) {
                this.container.removeChild(this.sprites[i])
                this.sprites.splice(i, 1)
            }
        } else if (obj instanceof p2.Spring) {
            const i = this.springs.indexOf(obj)
            if (i !== -1) {
                this.container.removeChild(this.springSprites[i])
                this.springSprites.splice(i, 1)
            }
        }
    }

    resize(w, h) {
        const { renderer } = this
        renderer.resize(w, h)
    }

    resizeToFit() {
        const dpr = this.getDevicePixelRatio()
        const rect = this.elementContainer.getBoundingClientRect()
        const w = rect.width * dpr
        const h = rect.height * dpr
        this.resize(w, h)
    }

    resizeBackground() {
        this.background.clear()
        this.background.beginFill(0xffffff)
        this.background.drawRect(0, 0, this.element.width, this.element.height)
        this.background.endFill()
    }

    getDevicePixelRatio() {
        return window.devicePixelRatio || 1
    }

    /**
     * Set the app state.
     * @param {number} state
     */
    setState(state) {
        this.state = state
        this.stateChangeEvent.state = state
        this.emit(this.stateChangeEvent)
        if (Demo.stateToolMap[state]) {
            this.settings.tool = state
            this.updateGUI()
        }
    }

    /**
     * Should be called by subclasses whenever there's a mousedown event
     */
    handleMouseDown(physicsPosition) {
        switch (this.state) {
            case Demo.DEFAULT:
                // Check if the clicked point overlaps bodies
                const result = this.world.hitTest(physicsPosition, this.world.bodies, this.pickPrecision)

                // Remove static bodies
                let b
                while (result.length > 0) {
                    b = result.shift()
                    if (b.type === p2.Body.STATIC) {
                        b = null
                    } else {
                        break
                    }
                }

                if (b) {
                    b.wakeUp()
                    this.setState(Demo.DRAGGING)
                    // Add mouse joint to the body
                    const localPoint = p2.vec2.create()
                    b.toLocalFrame(localPoint, physicsPosition)
                    this.world.addBody(this.nullBody)
                    this.mouseConstraint = new p2.RevoluteConstraint(this.nullBody, b, {
                        localPivotA: physicsPosition,
                        localPivotB: localPoint,
                        maxForce: 1000 * b.mass,
                    })
                    this.world.addConstraint(this.mouseConstraint)
                } else {
                    this.setState(Demo.PANNING)
                }
                break

            case Demo.DRAWPOLYGON:
                // Start drawing a polygon
                this.setState(Demo.DRAWINGPOLYGON)
                this.drawPoints = []
                const copy = p2.vec2.create()
                p2.vec2.copy(copy, physicsPosition)
                this.drawPoints.push(copy)
                this.emit(this.drawPointsChangeEvent)
                break

            case Demo.DRAWCIRCLE:
                // Start drawing a circle
                this.setState(Demo.DRAWINGCIRCLE)
                p2.vec2.copy(this.drawCircleCenter, physicsPosition)
                p2.vec2.copy(this.drawCirclePoint, physicsPosition)
                this.emit(this.drawCircleChangeEvent)
                break

            case Demo.DRAWRECTANGLE:
                // Start drawing a circle
                this.setState(Demo.DRAWINGRECTANGLE)
                p2.vec2.copy(this.drawRectStart, physicsPosition)
                p2.vec2.copy(this.drawRectEnd, physicsPosition)
                this.emit(this.drawRectangleChangeEvent)
                break
            default:
                break
        }
    }

    /**
     * Should be called by subclasses whenever there's a mousedown event
     */
    handleMouseMove(physicsPosition) {
        p2.vec2.copy(this.mousePosition, physicsPosition)

        const sampling = 0.4
        switch (this.state) {
            case Demo.DEFAULT:
            case Demo.DRAGGING:
                if (this.mouseConstraint) {
                    p2.vec2.copy(this.mouseConstraint.pivotA, physicsPosition)
                    this.mouseConstraint.bodyA.wakeUp()
                    this.mouseConstraint.bodyB.wakeUp()
                }
                break

            case Demo.DRAWINGPOLYGON:
                // drawing a polygon - add new point
                const sqdist = p2.vec2.distance(physicsPosition, this.drawPoints[this.drawPoints.length - 1])
                if (sqdist > sampling * sampling) {
                    const copy = [0, 0]
                    p2.vec2.copy(copy, physicsPosition)
                    this.drawPoints.push(copy)
                    this.emit(this.drawPointsChangeEvent)
                }
                break

            case Demo.DRAWINGCIRCLE:
                // drawing a circle - change the circle radius point to current
                p2.vec2.copy(this.drawCirclePoint, physicsPosition)
                this.emit(this.drawCircleChangeEvent)
                break

            case Demo.DRAWINGRECTANGLE:
                // drawing a rectangle - change the end point to current
                p2.vec2.copy(this.drawRectEnd, physicsPosition)
                this.emit(this.drawRectangleChangeEvent)
                break
            default:
                break
        }
    }

    /**
     * Should be called by subclasses whenever there's a mouseup event
     */
    handleMouseUp() {
        let b

        switch (this.state) {
            case Demo.DEFAULT:
                break

            case Demo.DRAGGING:
                // Drop constraint
                this.world.removeConstraint(this.mouseConstraint)
                this.mouseConstraint = null
                this.world.removeBody(this.nullBody)
                this.setState(Demo.DEFAULT)
                break

            case Demo.PANNING:
                this.setState(Demo.DEFAULT)
                break

            case Demo.DRAWINGPOLYGON:
                // End this drawing state
                this.setState(Demo.DRAWPOLYGON)
                if (this.drawPoints.length > 3) {
                    // Create polygon
                    b = new p2.Body({ mass: 1 })
                    if (
                        b.fromPolygon(this.drawPoints, {
                            removeCollinearPoints: 0.1,
                        })
                    ) {
                        this.world.addBody(b)
                    }
                }
                this.drawPoints = []
                this.emit(this.drawPointsChangeEvent)
                break

            case Demo.DRAWINGCIRCLE:
                // End this drawing state
                this.setState(Demo.DRAWCIRCLE)
                const R = p2.vec2.distance(this.drawCircleCenter, this.drawCirclePoint)
                if (R > 0) {
                    // Create circle
                    b = new p2.Body({ mass: 1, position: this.drawCircleCenter })
                    const circle = new p2.Circle({ radius: R })
                    b.addShape(circle)
                    this.world.addBody(b)
                }
                p2.vec2.copy(this.drawCircleCenter, this.drawCirclePoint)
                this.emit(this.drawCircleChangeEvent)
                break

            case Demo.DRAWINGRECTANGLE:
                // End this drawing state
                this.setState(Demo.DRAWRECTANGLE)
                // Make sure first point is upper left
                const start = this.drawRectStart
                const end = this.drawRectEnd
                for (let i = 0; i < 2; i++) {
                    if (start[i] > end[i]) {
                        const tmp = end[i]
                        end[i] = start[i]
                        start[i] = tmp
                    }
                }
                const width = Math.abs(start[0] - end[0])
                const height = Math.abs(start[1] - end[1])
                if (width > 0 && height > 0) {
                    // Create box
                    b = new p2.Body({
                        mass: 1,
                        position: [this.drawRectStart[0] + width * 0.5, this.drawRectStart[1] + height * 0.5],
                    })
                    const rectangleShape = new p2.Box({ width, height })
                    b.addShape(rectangleShape)
                    this.world.addBody(b)
                }
                p2.vec2.copy(this.drawRectEnd, this.drawRectStart)
                this.emit(this.drawRectangleChangeEvent)
                break
            default:
                break
        }

        if (b) {
            b.wakeUp()
            for (let i = 0; i < b.shapes.length; i++) {
                const s = b.shapes[i]
                s.collisionMask = this.newShapeCollisionMask
                s.collisionGroup = this.newShapeCollisionGroup
            }
        }
    }

    /**
     * @todo
     */
    createStats() {}

    /**
     * Update stats
     */
    updateStats() {
        this.stats_sum += this.world.lastStepTime
        this.stats_Nsummed++
        if (this.stats_Nsummed === this.stats_N) {
            this.stats_average = this.stats_sum / this.stats_N
            this.stats_sum = 0.0
            this.stats_Nsummed = 0
        }
    }

    /**
     * Add an object to the demo
     * @param  {mixed} obj Either Body or Spring
     */
    addVisual(obj) {
        if (obj instanceof p2.LinearSpring) {
            this.springs.push(obj)
            this.addRenderable(obj)
        } else if (obj instanceof p2.Body) {
            if (obj.shapes.length) {
                // Only draw things that can be seen
                this.bodies.push(obj)
                this.addRenderable(obj)
            }
        }
    }

    /**
     * Removes all visuals from the scene
     */
    removeAllVisuals() {
        const bodies = this.bodies
        const springs = this.springs
        while (bodies.length) {
            this.removeVisual(bodies[bodies.length - 1])
        }
        while (springs.length) {
            this.removeVisual(springs[springs.length - 1])
        }
    }

    /**
     * Remove an object from the demo
     * @param {mixed} obj Either Body or Spring
     */
    removeVisual(obj) {
        this.removeRenderable(obj)
        if (obj instanceof p2.LinearSpring) {
            const idx = this.springs.indexOf(obj)
            if (idx !== -1) {
                this.springs.splice(idx, 1)
            }
        } else if (obj instanceof p2.Body) {
            const idx = this.bodies.indexOf(obj)
            if (idx !== -1) {
                this.bodies.splice(idx, 1)
            }
        } else {
            console.error('Visual type not recognized...')
        }
    }

    updateEquationParameters() {
        this.world.setGlobalStiffness(this.settings.stiffness)
        this.world.setGlobalRelaxation(this.settings.relaxation)
    }

    addLogo() {
        const css = [
            'position:absolute',
            'left:10px',
            'top:15px',
            'text-align:center',
            'font: 13px Helvetica, arial, freesans, clean, sans-serif',
        ].concat(disableSelectionCSS)

        const div = document.createElement('div')
        div.innerHTML = [
            `<div style='${css.join(';')}' user-select='none'>`,
            "<h1 style='margin:0px'><a href='http://github.com/pmndrs/p2-es' style='color:black; text-decoration:none;'>p2-es</a></h1>",
            "<p style='margin:5px'>Physics Engine</p>",
            '</div>',
        ].join('')
        this.elementContainer.appendChild(div)
    }

    printConsoleMessage() {
        console.log(
            [
                `=== p2.js v${p2.version} ===`,
                'Welcome to the p2.js debugging environment!',
                'Did you know you can interact with the physics here in the console? Try executing the following:',
                '',
                '  world.gravity[1] = 10;',
                '',
            ].join('\n')
        )
    }

    /**
     * Draw a circle onto a graphics object
     * @method drawCircle
     * @static
     * @param  {PIXI.Graphics} g
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Number} radius
     * @param  {Number} color
     * @param  {Number} lineWidth
     */
    drawCircle(g, x, y, angle, radius, color, lineWidth, isSleeping) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

        lineWidth *= Demo.RES_SCALAR
        x *= Demo.RES_SCALAR
        y *= Demo.RES_SCALAR
        radius *= Demo.RES_SCALAR

        color = typeof color === 'number' ? color : 0xffffff
        g.lineStyle(lineWidth, 0x000000, 1)
        g.beginFill(color, isSleeping ? this.sleepOpacity : 1.0)
        g.drawCircle(x, y, radius)
        g.endFill()

        // line from center to edge
        g.moveTo(x, y)
        g.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))

        g.scale.set(1 / Demo.RES_SCALAR)
    }

    drawSpring(g, restLength, color, lineWidth) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
        color = typeof color === 'undefined' ? 0xffffff : color
        g.lineStyle(lineWidth, color, 1)
        if (restLength < lineWidth * 10) {
            restLength = lineWidth * 10
        }
        const M = 12
        const dx = restLength / M
        g.moveTo(-restLength / 2, 0)
        for (let i = 1; i < M; i++) {
            const x = -restLength / 2 + dx * i
            let y = 0
            if (i <= 1 || i >= M - 1) {
                // Do nothing
            } else if (i % 2 === 0) {
                y -= 0.1 * restLength
            } else {
                y += 0.1 * restLength
            }
            g.lineTo(x, y)
        }
        g.lineTo(restLength / 2, 0)
    }

    /**
     * Draw a finite plane onto a PIXI.Graphics.
     * @method drawPlane
     * @param  {PIXI.Graphics} g
     * @param  {Number} x0
     * @param  {Number} x1
     * @param  {Number} color
     * @param  {Number} lineWidth
     * @param  {Number} diagMargin
     * @param  {Number} diagSize
     * @todo Should consider an angle
     */
    drawPlane(g, x0, x1, color, lineColor, lineWidth, diagMargin, diagSize, maxLength) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
        color = typeof color === 'undefined' ? 0xffffff : color
        g.lineStyle(lineWidth, lineColor, 1)

        // Draw a fill color
        g.lineStyle(0, 0, 0)
        g.beginFill(color)
        const max = maxLength
        g.moveTo(-max, 0)
        g.lineTo(max, 0)
        g.lineTo(max, -max)
        g.lineTo(-max, -max)
        g.endFill()

        // Draw the actual plane
        g.lineStyle(lineWidth, lineColor)
        g.moveTo(-max, 0)
        g.lineTo(max, 0)
    }

    drawLine(g, offset, angle, len, color, lineWidth) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
        color = typeof color === 'undefined' ? 0x000000 : color
        g.lineStyle(lineWidth, color, 1)

        const startPoint = p2.vec2.fromValues(-len / 2, 0)
        const endPoint = p2.vec2.fromValues(len / 2, 0)

        p2.vec2.rotate(startPoint, startPoint, angle)
        p2.vec2.rotate(endPoint, endPoint, angle)

        p2.vec2.add(startPoint, startPoint, offset)
        p2.vec2.add(endPoint, endPoint, offset)

        g.moveTo(startPoint[0], startPoint[1])
        g.lineTo(endPoint[0], endPoint[1])
    }

    drawCapsule(g, x, y, angle, len, radius, color, fillColor, lineWidth, isSleeping) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1
        color = typeof color === 'undefined' ? 0x000000 : color
        g.lineStyle(lineWidth, color, 1)

        const { vec2 } = p2

        // Draw circles at ends
        const hl = len / 2
        g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0)
        const localPos = vec2.fromValues(x, y)
        const p0 = vec2.fromValues(-hl, 0)
        const p1 = vec2.fromValues(hl, 0)
        vec2.rotate(p0, p0, angle)
        vec2.rotate(p1, p1, angle)
        vec2.add(p0, p0, localPos)
        vec2.add(p1, p1, localPos)
        g.drawCircle(p0[0], p0[1], radius)
        g.drawCircle(p1[0], p1[1], radius)
        g.endFill()

        // Draw rectangle
        const pp2 = vec2.create()
        const p3 = vec2.create()
        vec2.set(p0, -hl, radius)
        vec2.set(p1, hl, radius)
        vec2.set(pp2, hl, -radius)
        vec2.set(p3, -hl, -radius)

        vec2.rotate(p0, p0, angle)
        vec2.rotate(p1, p1, angle)
        vec2.rotate(pp2, pp2, angle)
        vec2.rotate(p3, p3, angle)

        vec2.add(p0, p0, localPos)
        vec2.add(p1, p1, localPos)
        vec2.add(pp2, pp2, localPos)
        vec2.add(p3, p3, localPos)

        g.lineStyle(lineWidth, color, 0)
        g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0)
        g.moveTo(p0[0], p0[1])
        g.lineTo(p1[0], p1[1])
        g.lineTo(pp2[0], pp2[1])
        g.lineTo(p3[0], p3[1])
        // g.lineTo( hl*c - radius*s + x,  hl*s - radius*c + y);
        // g.lineTo(-hl*c - radius*s + x, -hl*s - radius*c + y);
        g.endFill()

        // Draw lines in between
        for (let i = 0; i < 2; i++) {
            g.lineStyle(lineWidth, color, 1)
            const sign = i === 0 ? 1 : -1
            vec2.set(p0, -hl, sign * radius)
            vec2.set(p1, hl, sign * radius)
            vec2.rotate(p0, p0, angle)
            vec2.rotate(p1, p1, angle)
            vec2.add(p0, p0, localPos)
            vec2.add(p1, p1, localPos)
            g.moveTo(p0[0], p0[1])
            g.lineTo(p1[0], p1[1])
        }
    }

    drawRectangle(g, x, y, angle, w, h, color, fillColor, lineWidth, isSleeping) {
        const path = [
            [w / 2, h / 2],
            [-w / 2, h / 2],
            [-w / 2, -h / 2],
            [w / 2, -h / 2],
        ]

        // Rotate and add position
        for (let i = 0; i < path.length; i++) {
            const v = path[i]
            p2.vec2.rotate(v, v, angle)
            p2.vec2.add(v, v, [x, y])
        }

        this.drawPath(g, path, color, fillColor, lineWidth, isSleeping)
    }

    drawConvex(g, verts, triangles, color, fillColor, lineWidth, debug, offset, isSleeping) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

        lineWidth *= Demo.RES_SCALAR
        verts.map((v) => {
            v[0] *= Demo.RES_SCALAR
            v[1] *= Demo.RES_SCALAR
        })

        color = typeof color === 'undefined' ? 0x000000 : color
        if (!debug) {
            g.lineStyle(lineWidth, color, 1)
            g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0)
            for (let i = 0; i !== verts.length; i++) {
                const v = verts[i]
                const x = v[0]
                const y = v[1]
                if (i === 0) {
                    g.moveTo(x, y)
                } else {
                    g.lineTo(x, y)
                }
            }
            g.endFill()
            if (verts.length > 2) {
                g.moveTo(verts[verts.length - 1][0], verts[verts.length - 1][1])
                g.lineTo(verts[0][0], verts[0][1])
            }
        } else {
            // convexes
            const colors = [0xff0000, 0x00ff00, 0x0000ff]
            for (let i = 0; i !== verts.length + 1; i++) {
                const v0 = verts[i % verts.length]
                const v1 = verts[(i + 1) % verts.length]
                const x0 = v0[0]
                const y0 = v0[1]
                const x1 = v1[0]
                const y1 = v1[1]
                g.lineStyle(lineWidth, colors[i % colors.length], 1)
                g.moveTo(x0, y0)
                g.lineTo(x1, y1)
                g.drawCircle(x0, y0, lineWidth * 2)
            }

            g.lineStyle(lineWidth, 0xff0000, 1)
            g.drawCircle(offset[0], offset[1], lineWidth * 2)
        }

        g.scale.set(1 / Demo.RES_SCALAR)
    }

    drawPath(g, path, color, fillColor, lineWidth, isSleeping) {
        lineWidth = typeof lineWidth === 'number' ? lineWidth : 1

        lineWidth *= Demo.RES_SCALAR
        path.map((p) => {
            p[0] *= Demo.RES_SCALAR
            p[1] *= Demo.RES_SCALAR
        })

        color = typeof color === 'undefined' ? 0x000000 : color
        g.lineStyle(lineWidth, color, 1)
        if (typeof fillColor === 'number') {
            g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0)
        }
        let lastx = null
        let lasty = null
        for (let i = 0; i < path.length; i++) {
            const v = path[i]
            const x = v[0]
            const y = v[1]
            if (x !== lastx || y !== lasty) {
                if (i === 0) {
                    g.moveTo(x, y)
                } else {
                    // Check if the lines are parallel
                    const p1x = lastx
                    const p1y = lasty
                    const p2x = x
                    const p2y = y
                    const p3x = path[(i + 1) % path.length][0]
                    const p3y = path[(i + 1) % path.length][1]
                    const area = (p2x - p1x) * (p3y - p1y) - (p3x - p1x) * (p2y - p1y)
                    if (area !== 0) {
                        g.lineTo(x, y)
                    }
                }
                lastx = x
                lasty = y
            }
        }
        if (typeof fillColor === 'number') {
            g.endFill()
        }

        // Close the path
        if (path.length > 2 && typeof fillColor === 'number') {
            g.moveTo(path[path.length - 1][0], path[path.length - 1][1])
            g.lineTo(path[0][0], path[0][1])
        }

        g.scale.set(1 / Demo.RES_SCALAR)
    }
}

Demo.elementClass = 'p2-canvas'
Demo.containerClass = 'p2-container'
Demo.DEFAULT = 1
Demo.PANNING = 2
Demo.DRAGGING = 3
Demo.DRAWPOLYGON = 4
Demo.DRAWINGPOLYGON = 5
Demo.DRAWCIRCLE = 6
Demo.DRAWINGCIRCLE = 7
Demo.DRAWRECTANGLE = 8
Demo.DRAWINGRECTANGLE = 9

Demo.RES_SCALAR = 20

Demo.toolStateMap = {
    'pick/pan [q]': Demo.DEFAULT,
    'polygon [d]': Demo.DRAWPOLYGON,
    'circle [a]': Demo.DRAWCIRCLE,
    'rectangle [f]': Demo.DRAWRECTANGLE,
}
Demo.stateToolMap = {}

for (const key of Object.keys(Demo.toolStateMap)) {
    Demo.stateToolMap[Demo.toolStateMap[key]] = key
}

Demo.keydownEvent = {
    type: 'keydown',
    originalEvent: null,
    keyCode: 0,
}

Demo.keyupEvent = {
    type: 'keyup',
    originalEvent: null,
    keyCode: 0,
}

Demo.zoomInEvent = {
    type: 'zoomin',
}
Demo.zoomOutEvent = {
    type: 'zoomout',
}

const disableSelectionCSS = [
    '-ms-user-select: none',
    '-moz-user-select: -moz-none',
    '-khtml-user-select: none',
    '-webkit-user-select: none',
    'user-select: none',
]

const init_containerPosition = p2.vec2.create()
const init_physicsPosition = p2.vec2.create()

const X = p2.vec2.fromValues(1, 0)
const distVec = p2.vec2.fromValues(0, 0)
let worldAnchorA = p2.vec2.fromValues(0, 0)
let worldAnchorB = p2.vec2.fromValues(0, 0)

/**
 * Component to hex
 * @param {number} c
 * @returns
 */
const componentToHex = (c) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

/**
 * RGB to hex
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns
 */
const rgbToHex = (r, g, b) => {
    return componentToHex(r) + componentToHex(g) + componentToHex(b)
}

/**
 * Returns a random pastel color hex
 * @returns {number} random pastel color hex
 */
const randomPastelHex = () => {
    const mix = [255, 255, 255]
    let red = Math.floor(Math.random() * 256)
    let green = Math.floor(Math.random() * 256)
    let blue = Math.floor(Math.random() * 256)

    // mix the color
    red = Math.floor((red + 3 * mix[0]) / 4)
    green = Math.floor((green + 3 * mix[1]) / 4)
    blue = Math.floor((blue + 3 * mix[2]) / 4)

    return rgbToHex(red, green, blue)
}
