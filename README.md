# p2-es

This is a maintained fork of [p2.js](https://github.com/schteppe/p2.js), originally created by Stefan Hedman [@schteppe](https://github.com/schteppe).

It is a type-safe flatbundle (esm and cjs) which allows for **tree shaking** and usage in modern environments.

If you're using three.js in a React environment with react-three-fiber, check out [use-p2](https://github.com/pmndrs/use-p2)! It's a wrapper around p2-es that runs in a web worker.

---

2D rigid body physics engine written in JavaScript. Includes collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

[Demos](http://pmndrs.github.io/p2-es/#demos) | [Examples](http://pmndrs.github.io/p2-es/#examples) | [Documentation](http://pmndrs.github.io/p2-es/docs/)

### Getting Started

**Usage with NPM**

```ts
yarn add p2-es
```

**CDN**

You can also import the esm bundle with unpkg:

```html
<script type="module">
    // import a specific version
    import * as p2 from 'https://www.unpkg.com/browse/p2-es@1.1.3/dist/p2-es.js';

    // or import latest
    import * as p2 from 'https://www.unpkg.com/browse/p2-es/dist/p2-es.js';
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

The following example uses the [World](http://pmndrs.github.io/p2-es/docs/classes/World.html), [Circle](http://pmndrs.github.io/p2-es/docs/classes/Circle.html), [Body](http://pmndrs.github.io/p2-es/docs/classes/Body.html) and [Plane](http://pmndrs.github.io/p2-es/docs/classes/Plane.html) classes to set up a simple physics scene with a ball on a plane.

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

|                                                                            | Circle | Plane |  Box   | Convex | Particle |  Line  | Capsule | Heightfield | Ray |
| :------------------------------------------------------------------------: | :----: | :---: | :----: | :----: | :------: | :----: | :-----: | :---------: | :-: |
|      [Circle](http://pmndrs.github.io/p2-es/docs/classes/Circle.html)      |  Yes   |   -   |   -    |   -    |    -     |   -    |    -    |      -      |  -  |
|       [Plane](http://pmndrs.github.io/p2-es/docs/classes/Plane.html)       |  Yes   |   -   |   -    |   -    |    -     |   -    |    -    |      -      |  -  |
|         [Box](http://pmndrs.github.io/p2-es/docs/classes/Box.html)         |  Yes   |  Yes  |  Yes   |   -    |    -     |   -    |    -    |      -      |  -  |
|      [Convex](http://pmndrs.github.io/p2-es/docs/classes/Convex.html)      |  Yes   |  Yes  |  Yes   |  Yes   |    -     |   -    |    -    |      -      |  -  |
|    [Particle](http://pmndrs.github.io/p2-es/docs/classes/Particle.html)    |  Yes   |  Yes  |  Yes   |  Yes   |    -     |   -    |    -    |      -      |  -  |
|        [Line](http://pmndrs.github.io/p2-es/docs/classes/Line.html)        |  Yes   |  Yes  | (todo) | (todo) |    -     |   -    |    -    |      -      |  -  |
|     [Capsule](http://pmndrs.github.io/p2-es/docs/classes/Capsule.html)     |  Yes   |  Yes  |  Yes   |  Yes   |   Yes    | (todo) |   Yes   |      -      |  -  |
| [Heightfield](http://pmndrs.github.io/p2-es/docs/classes/Heightfield.html) |  Yes   |   -   |  Yes   |  Yes   |  (todo)  | (todo) | (todo)  |      -      |  -  |
|         [Ray](http://pmndrs.github.io/p2-es/docs/classes/Ray.html)         |  Yes   |  Yes  |  Yes   |  Yes   |    -     |  Yes   |   Yes   |     Yes     |  -  |

Note that concave polygon shapes can be created using [Body.fromPolygon](https://pmndrs.github.io/p2-es/docs/classes/Body.html#fromPolygon).

### How to build

Make sure you have git, [Node.js](http://nodejs.org) and Yarn installed

```sh
git clone https://github.com/pmndrs/p2-es.git;
cd p2-es;
yarn install
yarn build
yarn generate-docs
yarn serve
```

### Release process

1. Create changesets as you make changes with `yarn run change`
2. Bump version number with `yarn run bump`
3. Build and generate docs, commit files in `dist/` and `docs/`.
4. Tag the commit with the version number e.g. vX.Y.Z
5. Add release notes to github
6. Publish to NPM with `yarn run publish`

### TODO

-   [ ] Convert demo framework to typescript and include in lib
-   [ ] Evaluate PRs in p2.js repo
    -   [ ] [Refactoring Springs](https://github.com/schteppe/p2.js/pull/148)
    -   [ ] [Adjustments to the buoyancy demo to make the code more easily reusable](https://github.com/schteppe/p2.js/pull/263)
