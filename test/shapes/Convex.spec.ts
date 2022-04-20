import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
// import { Ray } from '../../src/collision/Ray'
// import { RaycastResult } from '../../src/collision/RaycastResult'
import * as vec2 from '../../src/math/vec2'
import { Convex } from '../../src/shapes/Convex'

describe('Shape: Convex', () => {
    test('construct', () => {
        new Convex({ vertices: [] })

        // Should throw exception on clockwise winding
        expect(function () {
            new Convex({
                vertices: [
                    [-1, -1],
                    [-1, 1],
                    [1, 1],
                    [1, -1],
                ],
            })
        }).toThrow()
    })

    test('computeAABB', () => {
        const w = 2,
            h = 1
        const c = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
                [-w / 2, h / 2],
            ],
        })

        const aabb = new AABB()
        c.computeAABB(aabb, [1, 2], 0)

        expect(aabb.lowerBound[0]).toEqual(-w / 2 + 1)
        expect(aabb.lowerBound[1]).toEqual(-h / 2 + 2)
        expect(aabb.upperBound[0]).toEqual(w / 2 + 1)
        expect(aabb.upperBound[1]).toEqual(h / 2 + 2)
    })

    test('computeMomentOfInertia', () => {
        const w = 2,
            h = 1
        const c = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
                [-w / 2, h / 2],
            ],
        })
        const mass = 1
        const I = c.computeMomentOfInertia()
        const boxInertia = (mass * (h * h + w * w)) / 12

        // Convex computes square inertia correctly
        expect(Math.abs(I - boxInertia) < 0.01).toBeTruthy()
    })

    test('triangleArea', () => {
        expect(Convex.triangleArea([0, 0], [1, 0], [1, 1])).toEqual(1 / 2)
    })

    test('updateArea', () => {
        let c = new Convex({
            vertices: [
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ],
        })
        c.updateArea()
        expect(c.area).toEqual(4)

        c = new Convex({
            vertices: [
                [990, 0],
                [990, 10],
                [0, 10],
                [0, 0],
            ],
        })
        expect(c.area).toEqual(9900)
    })

    test('updateBoundingRadius', () => {
        const w = 2,
            h = 1
        const c = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
            ],
        })

        expect(c.boundingRadius).toEqual(Math.sqrt((w * w) / 4 + (h * h) / 4))
    })

    test('updateCenterOfMass', () => {
        // Test with box
        const c = new Convex({
            vertices: [
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ],
        })
        c.updateCenterOfMass()
        expect(c.centerOfMass[0]).toEqual(0)
        expect(c.centerOfMass[1]).toEqual(0)

        // rotate and translate all points
        const offset = vec2.fromValues(1, 1)
        for (let i = 0; i !== c.vertices.length; i++) {
            const v = c.vertices[i]
            vec2.rotate(v, v, Math.PI / 4)
            vec2.add(v, v, offset)
        }

        c.updateCenterOfMass()

        expect(Math.abs(c.centerOfMass[0] - offset[0]) < 0.01).toBeTruthy()
        expect(Math.abs(c.centerOfMass[1] - offset[1]) < 0.01).toBeTruthy()
    })

    test('updateTriangles', () => {
        const w = 2,
            h = 1
        const c = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
            ],
        })
        c.updateTriangles()
        expect([[0, 1, 2]]).toEqual(c.triangles)
    })

    test('pointTest', () => {
        const w = 2
        const h = 1
        const shape = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
            ],
        })
        expect(shape.pointTest([0, 0])).toEqual(true)
        expect(shape.pointTest([1, 0])).toEqual(true)
        expect(shape.pointTest([2, 0])).toEqual(false)
    })

    test('raycast', () => {
        const ray = new Ray({
            mode: Ray.CLOSEST,
            from: [0, 0],
            to: [10, 0],
        })

        const w = 1,
            h = 1
        const shape = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
                [-w / 2, h / 2],
            ],
        })
        const result = new RaycastResult()
        shape.raycast(result, ray, [1, 0], Math.PI / 2)
    })

    test('updateNormals', () => {
        const w = 1,
            h = 1

        const convex = new Convex({
            vertices: [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
                [-w / 2, h / 2],
            ],
        })
        expect(convex.normals[0][0]).toEqual(0)
        expect(convex.normals[0][1]).toEqual(-1)
        convex.vertices[0][1] = -h

        expect(convex.normals[0][0]).toEqual(0)
        expect(convex.normals[0][1]).toEqual(-1)

        convex.updateNormals()

        expect(convex.normals[0][0]).not.toEqual(0)
        expect(convex.normals[0][1]).not.toEqual(-1)
    })
})
