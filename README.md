p2-es
=====

This is a maintained fork of [p2.js](https://github.com/schteppe/p2.js), originally created by Stefan Hedman [@schteppe](https://github.com/schteppe).

It is a type-safe flatbundle (esm and cjs) which allows for **tree shaking** and usage in modern environments.

If you're using three.js in a React environment with react-three-fiber, check out [use-p2](https://github.com/pmndrs/use-p2)! It's a wrapper around p2-es that runs in a web worker.

---

2D rigid body physics engine written in JavaScript. Includes collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

[Demos](#demos) | [Examples](#examples) | [Documentation](http://pmndrs.github.io/p2-es/docs/)

### Getting Started

**Usage with NPM**

```ts
yarn add p2-es
```

**CDN**

You can also import the esm flatbundle via unpkg

```html
<script type="module">
    import * as p2 from 'https://www.unpkg.com/browse/p2-es@0.8.0/dist/p2-es.js';
</script>
```

---

If you would like to use ordinary `Array` instead of `Float32Array`, define `P2_ARRAY_TYPE` globally before loading the library.

```html
<script type="text/javascript">P2_ARRAY_TYPE = Array;</script>
<script type="module">
    import * as p2 from 'p2-es.js';
</script>
```

### Featured projects using p2.js

* [Google I/O 2015 Experiment](http://www.chromeexperiments.com/detail/io-2015-experiment) by Instrument
* [PixiLights, a Christmas Experiment](http://christmasexperiments.com/experiments/11) by Mat Groves
* [More...](https://github.com/schteppe/p2.js/wiki/Projects-using-p2.js)

### Demos

These demos use the p2 Demo framework, which provides rendering and interactivity. Use mouse/touch to throw or create objects. Use the right menu (or console!) to tweak parameters. Or just check the source to see how to programmatically build the current scene using p2.

* [Buoyancy](http://pmndrs.github.io/p2-es/demos/buoyancy.html)
* [Car](http://pmndrs.github.io/p2-es/demos/car.html)
* [CCD](http://pmndrs.github.io/p2-es/demos/ccd.html)
* [Circle container](http://pmndrs.github.io/p2-es/demos/circles.html)
* [Collision tests](http://pmndrs.github.io/p2-es/demos/collisions.html)
* [Compound objects](http://pmndrs.github.io/p2-es/demos/compound.html)
* [Concave objects](http://pmndrs.github.io/p2-es/demos/concave.html)
* [Constraints](http://pmndrs.github.io/p2-es/demos/constraints.html)
* [DistanceConstraint](http://pmndrs.github.io/p2-es/demos/distanceConstraint.html)
* [Fixed rotation](http://pmndrs.github.io/p2-es/demos/fixedRotation.html)
* [Fixed XY](http://pmndrs.github.io/p2-es/demos/fixedXY.html)
* [Friction](http://pmndrs.github.io/p2-es/demos/friction.html)
* [Gear constraint](http://pmndrs.github.io/p2-es/demos/gearConstraint.html)
* [Heightfield](http://pmndrs.github.io/p2-es/demos/heightfield.html)
* [Island solver](http://pmndrs.github.io/p2-es/demos/islandSolver.html)
* [Kinematic body](http://pmndrs.github.io/p2-es/demos/kinematic.html)
* [Lock constraint](http://pmndrs.github.io/p2-es/demos/lock.html)
* [Piston](http://pmndrs.github.io/p2-es/demos/piston.html)
* [Prismatic constraint](http://pmndrs.github.io/p2-es/demos/prismatic.html)
* [Ragdoll](http://pmndrs.github.io/p2-es/demos/ragdoll.html)
* [Sensor](http://pmndrs.github.io/p2-es/demos/removeSensor.html)
* [Restitution](http://pmndrs.github.io/p2-es/demos/restitution.html)
* [Sleep](http://pmndrs.github.io/p2-es/demos/sleep.html)
* [Segway](http://pmndrs.github.io/p2-es/demos/segway.html)
* [Sleep](http://pmndrs.github.io/p2-es/demos/sleep.html)
* [Springs](http://pmndrs.github.io/p2-es/demos/springs.html)
* [Surface velocity](http://pmndrs.github.io/p2-es/demos/surfaceVelocity.html)
* [Suspension](http://pmndrs.github.io/p2-es/demos/suspension.html)
* [Tearable constraints](http://pmndrs.github.io/p2-es/demos/tearable.html)
* [TopDownVehicle](http://pmndrs.github.io/p2-es/demos/topDownVehicle.html)

### Examples

Examples showing how to use p2.js with your favorite renderer.

* [Canvas: Asteroids game](http://pmndrs.github.io/p2-es/examples/canvas/asteroids.html)
* [Canvas: Box on plane](http://pmndrs.github.io/p2-es/examples/canvas/box.html)
* [Canvas: Character demo](http://pmndrs.github.io/p2-es/examples/canvas/character.html)
* [Canvas: Circle on plane](http://pmndrs.github.io/p2-es/examples/canvas/circle.html)
* [Canvas: Interpolation](http://pmndrs.github.io/p2-es/examples/canvas/interpolation.html)
* [Canvas: Mousejoint](http://pmndrs.github.io/p2-es/examples/canvas/mouseJoint.html)
* [Canvas: Raycasting](http://pmndrs.github.io/p2-es/examples/canvas/raycasting.html)
* [Canvas: Rayreflect](http://pmndrs.github.io/p2-es/examples/canvas/rayreflect.html)
* [Canvas: Sensors](http://pmndrs.github.io/p2-es/examples/canvas/sensors.html)
* [Canvas: Sensors 2](http://pmndrs.github.io/p2-es/examples/canvas/sensors2.html)
* [Pixi.js: Box on plane](http://pmndrs.github.io/p2-es/examples/pixijs/box.html)

### Sample code
The following example uses the [World](http://pmndrs.github.io/p2-es/docs/classes/World.html), [Circle](http://pmndrs.github.io/p2-es/docs/classes/Circle.html), [Body](http://pmndrs.github.io/p2-es/docs/classes/Body.html) and [Plane](http://pmndrs.github.io/p2-es/docs/classes/Plane.html) classes to set up a simple physics scene with a ball on a plane.

```js
// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10]
});

// Add a circle shape to the body
var circleShape = new p2.Circle({ radius: 1 });
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);

// Create an infinite ground plane body
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes it static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);

// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock
var lastTime;

// Animation loop
function animate(time){
	requestAnimationFrame(animate);

    // Compute elapsed time since last render frame
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

    // Move bodies forward in time
    world.step(fixedTimeStep, deltaTime, maxSubSteps);

    // Render the circle at the current interpolated position
    renderCircleAtPosition(circleBody.interpolatedPosition);

    lastTime = time;
}

// Start the animation loop
requestAnimationFrame(animate);
```

To interact with bodies, you need to do it *after each internal step*. Simply attach a *"postStep"* listener to the world, and make sure to use ```body.position``` here - ```body.interpolatedPosition``` is only for rendering.

```js
world.on('postStep', function(event){
    // Add horizontal spring force
    circleBody.force[0] -= 100 * circleBody.position[0];
});
```

### Supported collision pairs

|                                                                              | Circle | Plane | Box       | Convex | Particle | Line   | Capsule | Heightfield | Ray    |
| :--------------------------------------------------------------------------: |:------:|:-----:|:---------:|:------:|:--------:|:------:|:-------:|:-----------:|:------:|
| [Circle](http://pmndrs.github.io/p2-es/docs/classes/Circle.html)           | Yes    | -     | -         | -      | -        | -      | -       | -           | -      |
| [Plane](http://pmndrs.github.io/p2-es/docs/classes/Plane.html)             | Yes    | -     | -         | -      | -        | -      | -       | -           | -      |
| [Box](http://pmndrs.github.io/p2-es/docs/classes/Box.html)                 | Yes    | Yes   | Yes       | -      | -        | -      | -       | -           | -      |
| [Convex](http://pmndrs.github.io/p2-es/docs/classes/Convex.html)           | Yes    | Yes   | Yes       | Yes    | -        | -      | -       | -           | -      |
| [Particle](http://pmndrs.github.io/p2-es/docs/classes/Particle.html)       | Yes    | Yes   | Yes       | Yes    | -        | -      | -       | -           | -      |
| [Line](http://pmndrs.github.io/p2-es/docs/classes/Line.html)               | Yes    | Yes   | (todo)    | (todo) | -        | -      | -       | -           | -      |
| [Capsule](http://pmndrs.github.io/p2-es/docs/classes/Capsule.html)         | Yes    | Yes   | Yes       | Yes    | Yes      | (todo) | Yes     | -           | -      |
| [Heightfield](http://pmndrs.github.io/p2-es/docs/classes/Heightfield.html) | Yes    | -     | Yes       | Yes    | (todo)   | (todo) | (todo)  | -           | -      |
| [Ray](http://pmndrs.github.io/p2-es/docs/classes/Ray.html)                 | Yes    | Yes   | Yes       | Yes    | -        | Yes    | Yes     | Yes         | -      |

Note that concave polygon shapes can be created using [Body.fromPolygon](http://pmndrs.github.io/p2-es/docs/classes/Body.html#method_fromPolygon).

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

1. Bump version number.
2. Build and commit files in ```dist/``` and ```docs/```.
3. Tag the commit with the version number e.g. vX.Y.Z
4. Add release notes to github
5. Publish to NPM

### TODO

- [ ] add hasActiveBodies to World and use in use-p2 (see [cannon-es](https://github.com/pmndrs/cannon-es/blob/master/src/world/World.ts#L868)) 
- [ ] Evaluate PRs in p2.js repo
  - [ ] [Refactoring Springs](https://github.com/schteppe/p2.js/pull/148)
  - [ ] [Adjustments to the buoyancy demo to make the code more easily reusable](https://github.com/schteppe/p2.js/pull/263)


commit "remove @static and @method jsdoc tags"
