`p2-es` is a 2D rigid body physics engine written in JavaScript. Includes collision detection, contacts, friction, restitution, motors, springs, advanced constraints and various shape types.

**Usage with NPM**

```ts
yarn add p2-es
```

**CDN**

You can also import the esm bundle with unpkg:

```html
<script type="module">
    // import a specific version
    import * as p2 from 'https://www.unpkg.com/browse/p2-es@1.1.1/dist/p2-es.js';

    // or import latest
    import * as p2 from 'https://www.unpkg.com/browse/p2-es/dist/p2-es.js';
</script>
```

---

If you would like to use ordinary ```Array``` instead of ```Float32Array```, define ```P2_ARRAY_TYPE``` globally before loading the library.

```html
<script type="text/javascript">P2_ARRAY_TYPE = Array;</script>
<script type="module">
    import * as p2 from 'p2-es.js';
</script>
```

## Contents

- [Core concepts](#core-concepts)
- [Hello p2-es!](#hello-p2-es)
- [Math](#math)
- [Collision](#collision)
- [Dynamics](#dynamics)
- [Shapes](#shapes)
- [Bodies](#bodies)
- [Constraints](#constraints)
- [Equations](#equations)
- [Events](#events)
- [Materials](#materials)
- [World](#world)
- [Solvers](#solvers)
- [The Demo framework](#the-demo-framework)
- [Limitations](#limitations)
- [References](#references)

Welcome to the p2-es manual. This manual is supposed to cover the things that the automatically generated documentation don't. It should cover the majority of the p2-es API from the latest release (see releases).

It's assumed that you are familiar with basic physics concepts, such as mass, force, torque, and impulses. If not, consult Google and/or Wikipedia. p2-es is written in JavaScript, and hence you are also expected to be experienced in JavaScript programming.

If you have questions or feedback, please create a new issue.

## Core concepts

**Shape** A geometrical shape, such as a sphere or a box.

**Rigid body** A piece of matter that is assumed indefinitely stiff. Any two points in a rigid body are assumed to always be at a constant distance from each other. We may refer to a rigid body by just saying "body". A rigid body has got a shape and a number of physical properties such as mass and inertia.

**Constraint** A constraint is a physical connection that removes degrees of freedom from bodies. In 3D a body has 6 degrees of freedom (three translation coordinates and three rotation coordinates). In 2D, there are 3 (two translational and one rotational). If we take a 3D door and put it on a door hinge we have constrained the door body to the wall. At this point the body can only rotate about the door hinge, so the constraint has removed 5 degrees of freedom.

**Contact constraint** A special constraint designed to prevent penetration of rigid bodies and to simulate friction and restitution. You do not create contact constraints; they are created automatically.

**World** A physics world is a collection of bodies and constraints that interact together.

**Solver** The physics world has a solver that is used to resolve constraints.

**Units** A unit is a way of measuring quantities such as length and time. In p2-es, we use meters-kilogram-second (MKS) units, and radians are used for angles. Do not use pixels for units.

## Hello p2-es!

Let's create a simple physics world, with a dynamic circle on a static plane. We begin with creating the world.

```js
var world = new p2.World({
    gravity: [0, -9.82],
})
```

This creates a World instance and sets gravity to 9.82 along the negative Y axis.

Now, let's create a circle body.

```js
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10],
})
```

This will create an empty, 5-kilogram body at position x=0, y=10. To make it into a circle, we need to add a Shape to it.

```js
var circleShape = new p2.Circle({ radius: 1 })
circleBody.addShape(circleShape)
```

Now we have created a body and added a circle shape to it. If you start the simulation now, the circle will start falling and never stop. Let's create a plane that it can rest on.

```js
var groundShape = new p2.Plane()
var groundBody = new p2.Body({
    mass: 0,
})
groundBody.addShape(groundShape)
```

By setting mass to zero, we tell the physics engine that the body should be static. By default, the position of a body is at the origin, which is fine for our Plane.

Before we can start our simulation, we must add our bodies to the world.

```js
world.addBody(circleBody)
world.addBody(groundBody)
```

Now we are ready to integrate the world.

```js
var timeStep = 1 / 60
setInterval(function () {
    world.step(timeStep)
    console.log('Circle x position: ' + circleBody.position[0])
    console.log('Circle y position: ' + circleBody.position[1])
    console.log('Circle angle: ' + circleBody.angle)
}, 1000 * timeStep)
```

You will get the position and angle of the circle body printed to the console (no graphical output this time). The result might look something like this:

```
Circle x position: 0
Circle y position: 10
Circle angle: 0
Circle x position: 0
Circle y position: 9
Circle angle: 0
...
Circle x position: 0
Circle y position: 0.5
Circle angle: 0
```

## Math

p2-es uses an own, stripped version of the [glMatrix](http://glmatrix.net/) math library. The p2 vector methods are documented [here](https://pmndrs.github.io/p2-es/docs/modules/vec2.html). The glMatrix math functions are exposed through the library, so you can use them like this:

```ts
var force = p2.vec2.fromValues(1, 0)
p2.vec2.add(body.force, body.force, force) // body.force += force
```

## Collision

TODO

## Dynamics

TODO

## Shapes

The available shapes are:

-   [Box](./classes/Box.html)
-   [Capsule](./classes/Capsule.html)
-   [Circle](./classes/Circle.html)
-   [Convex](./classes/Convex.html)
-   [Heightfield](./classes/Heightfield.html)
-   [Line](./classes/Line.html)
-   [Particle](./classes/Particle.html)
-   [Plane](./classes/Plane.html)

### Filtering shape collisions

You can use bit masks to enable or disable collisions between individual groups of shapes. For a full explanation, see this tutorial.

```js
// Setup bits for each available group
var PLAYER = Math.pow(2, 0), // 00000000000000000000000000000001 in binary
    ENEMY = Math.pow(2, 1), // 00000000000000000000000000000010 in binary
    GROUND = Math.pow(2, 2) // 00000000000000000000000000000100 in binary

// Put shapes into their groups
player1Shape.collisionGroup = PLAYER
player2Shape.collisionGroup = PLAYER
enemyShape.collisionGroup = ENEMY
groundShape.collisionGroup = GROUND

// Assign groups that each shape collide with.
// Note that the players can collide with ground and enemies, but not with other players.
player1Shape.collisionMask = ENEMY | GROUND
player2Shape.collisionMask = ENEMY | GROUND
enemyShape.collisionMask = PLAYER | GROUND
groundShape.collisionMask = PLAYER | ENEMY
```

This is how the collision filter check is done between two shapes:

```js
if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
    // The shapes can collide
}
```

In JavaScript, you can use 32 valid groups (Math.pow(2,0) up to Math.pow(2,31)). If you use the mask 0 it won't match with any other shape group, and mask -1 will match all groups.

```js
allCollisionsShape.collisionMask = -1
noCollisionsShape.collisionMask = 0
```

## Bodies

### Body types

The body can be one of three types, `Body.STATIC`, `Body.KINEMATIC`, and `Body.DYNAMIC`.

-   `Dynamic` bodies interact with all other bodies and can move.
-   `Static` bodies do not move, but interact with dynamic bodies.
-   `Kinematic` bodies can be controlled via velocity, but they behave like static bodies otherwise.

```js
// By setting the mass of a body to a nonzero number, the body
// will become dynamic and will move and interact with other bodies.
var dynamicBody = new Body({
    mass: 1,
})
console.log(dynamicBody.type == Body.DYNAMIC) // true

// Bodies are static if mass is not specified or zero. Static bodies will never move.
var staticBody = new Body()
console.log(staticBody.type == Body.STATIC) // true

// Kinematic bodies will only move if you change their velocity.
var kinematicBody = new Body({
    type: Body.KINEMATIC,
})
```

### Mass properties

The body has mass and inertia. You can set the body mass when you create the body, or change it dynamically during simulation.

```js
var body = new p2.Body({
    mass: 3,
})
```

```js
// Dynamically
body.mass = 1
body.updateMassProperties()
```

You can also change the type of the body dynamically, but in the same way, you have to update the mass properties.

```js
// Change body type dynamically
body.type = p2.Body.KINEMATIC
body.updateMassProperties()
```

## Constraints

Constraints are used to constrain bodies to each other. Typical examples in games include ragdolls, teeters, and pulleys. Constraints can be combined in many different ways to create interesting motions.

Some constraints provide limits so you can control the range of motion. Some constraints provide motors which can be used to drive the constraint at a prescribed speed until a prescribed force/torque is exceeded.

Constraint motors can be used in many ways. You can use motors to control position by specifying a velocity that is proportional to the difference between the actual and desired position. You can also use motors to simulate friction: set the velocity to zero and provide a small, but significant maximum motor force/torque. Then the motor will attempt to keep the constraint from moving until the load becomes too strong.

### RevoluteConstraint

A revolute constraint forces two bodies to share a common anchor point, often called a hinge point. The revolute constraint has a single degree of freedom: the relative rotation of the two bodies. This is called the constraint angle.

To specify a revolute you need to provide two bodies and a single anchor point in world space. The initialization function assumes that the bodies are already in the correct position. Alternatively, you can initialize tge constraint using two anchor points defined locally in each body.

In this example, two bodies are connected by a revolute joint at the first body's center of mass.

```js
var constraint = new RevoluteConstraint({
    bodyA: bodyA,
    bodyB: bodyB,
    worldPivot: bodyA.position,
})
```

The revolute joint angle is positive when bodyB rotates CCW about the angle point. Like all angles in p2-es, the revolute angle is measured in radians. By convention the revolute joint angle is zero when the joint is created, regardless of the current rotation of the two bodies.

In some cases you might wish to control the constraint angle. For this, the revolute constraint can optionally simulate a constraint limit and/or a motor.

A limit forces the angle to remain between a lower and upper bound. The limit will apply as much torque as needed to make this happen. The limit range should include zero, otherwise the joint will lurch when the simulation begins.

A motor allows you to specify the joint speed (the time derivative of the angle). The speed can be negative or positive. A motor can have infinite force, but this is usually not desirable. Recall the eternal question:

_"What happens when an irresistible force meets an immovable object?"_

I can tell you it's not pretty. So you can provide a maximum torque for the constraint motor. The motor will maintain the specified speed unless the required torque exceeds the specified maximum. When the maximum torque is exceeded, the motor will slow down and can even reverse. You can use a motor to simulate friction. Just set the motor speed to zero, and set the maximum torque to some small, but significant value. The motor will try to prevent the constraint from rotating, but will yield to a significant load.

### DistanceConstraint

One of the simplest constraints is a distance constraint, which says that the distance between two points on two bodies must be constant. When you specify a distance constraint you specify the two anchor points in local body coordinates. If you don't provide a distance parameter, the current distance will be used.

The distance constraint can also be made soft, like a spring-damper connection. Softness is achieved by tuning two constants: stiffness and relaxation. Think of the stiffness as the frequency of a harmonic oscillator (like a guitar string).

```js
distanceConstraint.setStiffness(10)
distanceConstraint.setRelaxation(4)
```

### GearConstraint

TODO

### HingeConstraint

TODO

### PrismaticConstraint

TODO

## Equations

Every Constraint have a number of Equations that should be solved by the Solver. In most cases, the user don't have to deal with Equations directly but they can be useful sometimes.

It was mentioned that a Constraint removes a number of degrees of freedom between two bodies. Each Equation removes one degree of freedom.

As an example, the LockConstraint (which removes all three degrees of freedom) has one Equation that removes motion along X, one for Y, and one for rotation. Given that the third equation in the LockConstraint is for rotational motion, the statement `lockConstraint.equations[0].enabled=false;` will stop locking the angle between the bodies.

## Events

### postStep

The `postStep` event is probably where you want to apply forces on your bodies, since the forces are set to zero after each step.

```ts
world.on('postStep', function () {
    body.force[0] -= 10 * body.position[0]
})
```

### Events fired during step

Some events are fired during the execution of `world.step()`. This is great, because it allows you to modify the behavior of the step. But you have to be careful: if you for example remove a body during a step then the world will most likely break apart. Therefore: read the documentation for the events you use, and be careful!

Don't do this:

```js
world.on('beginContact', function (evt) {
    world.removeBody(evt.bodyA) // BAD!
})
```

Instead, you can save the removal until after the step:

```js
var removeBody
world.on('beginContact', function (evt) {
    removeBody = evt.bodyA
})
// Simulation loop
setInterval(function () {
    world.step(timeStep)
    if (removeBody) {
        world.removeBody(removeBody) // GOOD!
        removeBody = null
    }
}, (1 / 60) * 1000)
```

## Materials

Materials are set per shape. Let's create two circles, one made of ice and one made of steel.

```js
var iceMaterial = new p2.Material()
var steelMaterial = new p2.Material()

var iceCircleShape = new p2.Circle({ radius: 0.5 })
var steelCircleShape = new p2.Circle({ radius: 0.5 })

iceCircleShape.material = iceMaterial
steelCircleShape.material = steelMaterial
```

When two materials meet, phenomena like friction and restitution occur. You can look up friction values for [different material pairs on wikipedia](http://en.wikipedia.org/wiki/Friction#Approximate_coefficients_of_friction). In our case with ice and steel, we can see that the friction value is `0.03`.

To define the friction and restitution for a material pair in p2-es, you must create a ContactMaterial.

```js
var iceSteelContactMaterial = new p2.ContactMaterial(iceMaterial, steelMaterial, {
    friction: 0.03,
})
world.addContactMaterial(iceSteelContactMaterial)
```

The [`ContactMaterial`](http://pmndrs.github.io/p2-esjs/docs/classes/ContactMaterial.html) holds many other properties such as restitution and surface velocity.

If there is a contact between to shapes that don't have a ContactMaterial, then a default contact material is used. This contact material can be reached via world.defaultContactMaterial.

## World

### Gravity

Gravity is global in the World, and it will be applied to all bodies each time step. You can set and get the current gravity vector from world.gravity.

```js
world.gravity[0] = 0 // x
world.gravity[1] = -9.82 // y
// or:
p2.vec2.set(world.gravity, 0, -9.82)
```

There are times when you don't want to apply gravity to all bodies. In this case you must turn off global gravity and start applying gravity force yourself.

```js
// Turn off global gravity
world.applyGravity = false

// Keep track of which bodies you want to apply gravity on:
var gravityBodies = [body1, body2, body3]

// And just before running world.step(), do this:
var gravity = p2.vec2.fromValues(0, -9.82),
    gravityForce = p2.vec2.create()
for (var i = 0; i < gravityBodies.length; i++) {
    var b = gravityBodies[i]
    p2.vec2.scale(gravityForce, gravity, b.mass) // F_gravity = m*g
    p2.vec2.add(b.force, b.force, gravityForce) // F_body += F_gravity
}
```

### Stepping the world

When you simply want to move the simulation forward in time, you run `world.step(fixedTimeStep)`, where fixedTimeStep is the "resolution" of your physics simulation.

```js
// Framerate dependent - Fail!
var fixedTimeStep = 1 / 60
requestAnimationFrame(function animloop(timeMilliseconds) {
    requestAnimationFrame(animloop)
    world.step(fixedTimeStep)
})
```

If you try using this method in your rendering loop, you'll soon notice that the speed of objects will depend on the frame rate in which you are running your simulation. On mobile devices, the framerate is often capped to 30Hz instead of 60Hz that you get on desktop. Therefore, objects will move slower on mobile than on desktop. Luckily, p2-es has you covered!

The full signature of `World.prototype.step` is:

```js
world.step(fixedTimeStep, timeSinceLastCall, maxSubSteps)
```

If you pass all three parameters, p2-es will make sure that your simulation runs at the same pace at every frame rate.

```js
// Frame rate independent! Success!
var fixedTimeStep = 1 / 60, maxSubSteps = 10, lastTimeMilliseconds;
requestAnimationFrame(function animloop(timeMilliseconds){
    requestAnimationFrame(animloop);
    var timeSinceLastCall = 0;
    if(timeMilliseconds !== undefined && lastTimeMilliseconds !== undefined){
        timeSinceLastCall = (timeMilliseconds - lastTimeMilliseconds) / 1000;
    }
    world.step(fixedTimeStep, timeSinceLastCall, maxSubSteps);
    lastTimeMilliseconds = timeMilliseconds;
}
```

But how does this work?

You've already used the first parameter. Each time p2-es moves the time forward, it will progress its internal physics clock by this value. If you only pass this parameter, p2-es will take a single fixed step forward in time and use this time step.

The second parameter, `timeSinceLastCall`, is simply the delta time since you last called the method. p2-es has an internal "wall clock" that it will accumulate this value onto.

When you call the method with three arguments, p2-es will do fixed steps until the "physics clock" is in sync with the "wall clock". This is the trick to get framerate independence. The last parameter should be self-explanatory: it's the maximum number of fixed steps to use for each `step()` call.

It's important that `timeSinceLastCall` is always less than `maxSubSteps * fixedTimeStep`, otherwise you are losing time.

Note that the time values are measured in seconds, and not milliseconds. A common and easy mistake is to just pass it the value passed by `requestAnimationFrame`, `Date.now()` or `performance.now()`. This mistake can give strange results such as: No framerate dependence no matter what you do. Objects not moving at all until you apply a huge force and then they give huge acceleration. Simply divide the time by 1000 before passing to step().

### fixedTimeStep size

By decreasing the size of fixedTimeStep, you are increasing the "resolution" of the simulation. If you are finding that your objects are moving very fast and escaping from your walls instead of colliding with them, then one way to help fix this problem is by decreasing fixedTimeStep. If you do this, then you will need to increase maxSubSteps to ensure that timeSinceLastCall < maxSubSteps \* fixedTimeStep.

### Interpolation

Another thing that p2-es does is interpolation of movement. If you pass all three parameters to world.step(), then you'll get an interpolated position for each Body via body.interpolatedPosition and body.interpolatedAngle. The movement will look a lot smoother if you use these values for rendering instead of .position and .angle.

### Example

```js
var maxSubSteps = 10
var fixedTimeStep = 1 / 60
var lastTimeSeconds
function animate(t) {
    requestAnimationFrame(animate)
    var timeSeconds = t / 1000
    lastTimeSeconds = lastTimeSeconds || timeSeconds
    var timeSinceLastCall = timeSeconds - lastTimeSeconds
    world.step(fixedTimeStep, timeSinceLastCall, maxSubSteps)
    renderBody(body.interpolatedPosition, body.interpolatedAngle)
}
requestAnimationFrame(animate)
```

## Solvers

A solver is an algorithm for solving a linear systems of equations. In p2-es, it resolves constraints, contacts, and friction.

### GSSolver

There are currently two solvers in p2-es. The most stable one is the GSSolver. This solver is iterative, which means that it converges to a solution in a number of iterations. In general, more iterations means better solution.

```js
world.solver = new GSSolver()
world.solver.iterations = 5 // Fast, but contacts might look squishy...
world.solver.iterations = 50 // Slow, but contacts look good!
```

### Island solving

Instead of solving the whole system at once, one can split it into independent parts (called "islands") and solve them independently.

This has most benefit if the islands can be solved in parallel, but it still has advantages when solving serially in a single thread, especially when the solver tolerance is larger than zero. The solver can then bail out very early for some islands of the simulation while other islands gets more iterations.

```js
var world = new p2.World({
    islandSplit: true,
})
world.solver.tolerance = 0.01
```

### Solver parameters

The solver parameters are set on the Equation objects. You provide constraint stiffness and relaxation, like so:

```js
equation.stiffness = 1e8
equation.relaxation = 4
equation.updateSpookParams(timeStep)
```

You can think of stiffness as the stiffness of a spring, which gives a force F=-k\*x where x is the displacement of the spring. Relaxation is corresponds to the number of time steps you need to take to stabilize the constraint (larger value leads to a softer contact).

The mostly central equation types are ContactEquation and FrictionEquation. These equations are automatically created as contacts appear in your scene. To change the stiffness and relaxation of these, use the following ContactMaterial properties.

```js
contactMaterial.stiffness = 1e8
contactMaterial.relaxation = 3
contactMaterial.frictionStiffness = 1e8
contactMaterial.frictionRelaxation = 3
```

You can also set stiffness and relaxation on Constraint equations. Just loop over all its equations one by one.

## The Demo framework

To make it simple to debug and test the features of p2-es, a custom rendering library was made. This library is completely separated from p2-es, so you can replace it with your own renderer.

The demo framework has an interactive menu to the right. Use it to:

-   Interact with objects via the mouse (pick and pull)
-   Create new objects on the fly
-   Pause and play simulation
-   Manually stepping through the simulation
-   Control simulation parameters such as step size, max sub steps, etc.
-   Change gravity
-   Tweak global solver parameters (iterations, stiffness, relaxation, tolerance)

## Limitations

TODO

## References

p2-es is based on the literature from the course [Visual Interactive Simulation](http://www8.cs.umu.se/kurser/5DV058/) at Umeå University. Dive into the course readings and lab information if you want to know more about how the physics engine works! One of the best readings to start with is probably the [SPOOK lab notes](http://www8.cs.umu.se/kurser/5DV058/VT15/lectures/SPOOKlabnotes.pdf).
