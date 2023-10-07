# p2-es

p2-es is a 2D rigid body physics engine written in JavaScript. Features include collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

[Demos](https://p2-es.pmnd.rs/#demos) | [Examples](https://p2-es.pmnd.rs/#examples) | [Documentation](https://p2-es.pmnd.rs/docs/)

This is a maintained fork of [p2.js](https://github.com/schteppe/p2.js), originally created by Stefan Hedman [@schteppe](https://github.com/schteppe). It is a type-safe flatbundle (esm and cjs) which allows for **tree shaking** and usage in modern environments.

If you're using three.js in a React environment with react-three-fiber, check out [use-p2](https://github.com/pmndrs/use-p2)! It's a wrapper around p2-es that runs in a web worker.

### Getting Started

**NPM**

```ts
npm install p2-es
yarn add p2-es
```

**CDN**

You can also import the esm bundle with unpkg:

```html
<script type="module">
    // import a specific version
    import * as p2 from 'https://www.unpkg.com/p2-es@1.1.6/dist/p2-es.js'

    // or import latest
    import * as p2 from 'https://www.unpkg.com/p2-es/dist/p2-es.js'
</script>
```

---

If you would like to use ordinary `Array` instead of `Float32Array`, define `P2_ARRAY_TYPE` globally before loading the library.

```html
<script type="text/javascript">
    P2_ARRAY_TYPE = Array
</script>
<script type="module">
    import * as p2 from 'p2-es.js'
</script>
```

### Sample code

The following example uses the [World](https://p2-es.pmnd.rs/docs/classes/World.html), [Circle](https://p2-es.pmnd.rs/docs/classes/Circle.html), [Body](https://p2-es.pmnd.rs/docs/classes/Body.html) and [Plane](https://p2-es.pmnd.rs/docs/classes/Plane.html) classes to set up a simple physics scene with a ball on a plane.

```js
import * as p2 from 'p2-es'

// Create a physics world, where bodies and constraints live
const world = new p2.World({
    gravity: [0, -9.82],
})

// Create an empty dynamic body
const circleBody = new p2.Body({
    mass: 5,
    position: [0, 10],
})

// Add a circle shape to the body
const circleShape = new p2.Circle({ radius: 1 })
circleBody.addShape(circleShape)

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody)

// Create an infinite ground plane body
const groundBody = new p2.Body({
    mass: 0, // Setting mass to 0 makes it static
})
const groundShape = new p2.Plane()
groundBody.addShape(groundShape)
world.addBody(groundBody)

// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
const fixedTimeStep = 1 / 60 // seconds
const maxSubSteps = 10 // Max sub steps to catch up with the wall clock
let lastTime = 0

// Animation loop
function animate(time) {
    requestAnimationFrame(animate)

    // Compute elapsed time since last render frame
    const deltaTime = (time - lastTime) / 1000

    // Move bodies forward in time
    world.step(fixedTimeStep, deltaTime, maxSubSteps)

    // Render the circle at the current interpolated position
    renderCircleAtPosition(circleBody.interpolatedPosition)

    lastTime = time
}

// Start the animation loop
requestAnimationFrame(animate)
```

To interact with bodies, you need to do it _after each internal step_. Simply attach a _"postStep"_ listener to the world, and make sure to use `body.position` here - `body.interpolatedPosition` is only for rendering.

```js
world.on('postStep', function (event) {
    // Add horizontal spring force
    circleBody.force[0] -= 100 * circleBody.position[0]
})
```

### Supported collision pairs

|                                                                    | Circle | Plane |  Box   | Convex | Particle |  Line  | Capsule | Heightfield | Ray |
| :----------------------------------------------------------------: | :----: | :---: | :----: | :----: | :------: | :----: | :-----: | :---------: | :-: |
|      [Circle](https://p2-es.pmnd.rs/docs/classes/Circle.html)      |  Yes   |   -   |   -    |   -    |    -     |   -    |    -    |      -      |  -  |
|       [Plane](https://p2-es.pmnd.rs/docs/classes/Plane.html)       |  Yes   |   -   |   -    |   -    |    -     |   -    |    -    |      -      |  -  |
|         [Box](https://p2-es.pmnd.rs/docs/classes/Box.html)         |  Yes   |  Yes  |  Yes   |   -    |    -     |   -    |    -    |      -      |  -  |
|      [Convex](https://p2-es.pmnd.rs/docs/classes/Convex.html)      |  Yes   |  Yes  |  Yes   |  Yes   |    -     |   -    |    -    |      -      |  -  |
|    [Particle](https://p2-es.pmnd.rs/docs/classes/Particle.html)    |  Yes   |  Yes  |  Yes   |  Yes   |    -     |   -    |    -    |      -      |  -  |
|        [Line](https://p2-es.pmnd.rs/docs/classes/Line.html)        |  Yes   |  Yes  | (todo) | (todo) |    -     |   -    |    -    |      -      |  -  |
|     [Capsule](https://p2-es.pmnd.rs/docs/classes/Capsule.html)     |  Yes   |  Yes  |  Yes   |  Yes   |   Yes    | (todo) |   Yes   |      -      |  -  |
| [Heightfield](https://p2-es.pmnd.rs/docs/classes/Heightfield.html) |  Yes   |   -   |  Yes   |  Yes   |  (todo)  | (todo) | (todo)  |      -      |  -  |
|         [Ray](https://p2-es.pmnd.rs/docs/classes/Ray.html)         |  Yes   |  Yes  |  Yes   |  Yes   |    -     |  Yes   |   Yes   |     Yes     |  -  |

Note that concave polygon shapes can be created using [Body.fromPolygon](https://p2-es.pmnd.rs/docs/classes/Body.html#fromPolygon).

### Building

Make sure you have git, [Node.js](http://nodejs.org) v14+ and Yarn installed

```sh
git clone https://github.com/pmndrs/p2-es.git && cd p2-es

# install deps
yarn

# build p2-es
(cd packages/p2-es && yarn build)

# build the website
yarn build

npx http-server apps/p2-es-website/dist
```
