import * as p2 from 'p2-es'

var world,
    timeStep = 1 / 60,
    array = null,
    N = 20

self.onmessage = function (e) {
    if (!world) {
        N = e.data.N

        // Create a world
        world = new p2.World({
            gravity: [0, -5],
        })

        // Ground plane
        var planeShape = new p2.Plane()
        var groundBody = new p2.Body({
            mass: 0,
        })
        groundBody.addShape(planeShape)
        world.addBody(groundBody)

        // Create N boxes
        for (var i = 0; i !== N; i++) {
            var boxBody = new p2.Body({
                mass: 1,
                position: [Math.random() - 0.5, e.data.boxHeight * i + 0.5, Math.random() - 0.5],
            })
            var boxShape = new p2.Box({ width: e.data.boxWidth, height: e.data.boxHeight })
            boxBody.addShape(boxShape)
            world.addBody(boxBody)
        }

        setInterval(function () {
            // Step the world
            world.step(timeStep)

            if (array) {
                for (var i = 0; i !== world.bodies.length; i++) {
                    var b = world.bodies[i]
                    array[3 * i + 0] = b.position[0]
                    array[3 * i + 1] = b.position[1]
                    array[3 * i + 2] = b.angle
                }

                // Send data back to the main thread
                self.postMessage(array, [array.buffer])
                array = null
            }
        }, timeStep * 1000)
    } else {
        // We got a new buffer
        array = e.data
    }
}
