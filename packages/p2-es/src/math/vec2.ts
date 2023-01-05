/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * The vec2 object from glMatrix, with some extensions and some removed methods.
 * @see http://glmatrix.net
 */

import type { Vec2 } from '../types'
import { ARRAY_TYPE } from '../utils/Utils'

/**
 * Make a cross product and only return the z component
 * @param a
 * @param b
 * @return
 */
export function crossLength(a: Vec2, b: Vec2): number {
    return a[0] * b[1] - a[1] * b[0]
}

/**
 * Cross product between a vector and the Z component of a vector
 * @param out
 * @param vec
 * @param zcomp
 * @return
 */
export function crossVZ(out: Vec2, vec: Vec2, zcomp: number): Vec2 {
    rotate(out, vec, -Math.PI / 2) // Rotate according to the right hand rule
    scale(out, out, zcomp) // Scale with z
    return out
}

/**
 * Cross product between a vector and the Z component of a vector
 * @param out
 * @param zcomp
 * @param vec
 * @return
 */
export function crossZV(out: Vec2, zcomp: number, vec: Vec2) {
    rotate(out, vec, Math.PI / 2) // Rotate according to the right hand rule
    scale(out, out, zcomp) // Scale with z
    return out
}

/**
 * Rotate a vector by an angle
 * @param out
 * @param a
 * @param angle
 * @return
 */
export function rotate(out: Vec2, a: Vec2, angle: number): Vec2 {
    if (angle !== 0) {
        const c = Math.cos(angle),
            s = Math.sin(angle),
            x = a[0],
            y = a[1]
        out[0] = c * x - s * y
        out[1] = s * x + c * y
    } else {
        out[0] = a[0]
        out[1] = a[1]
    }
    return out
}

/**
 * Rotate a vector 90 degrees clockwise
 * @param out
 * @param a
 * @return
 */
export function rotate90cw(out: Vec2, a: Vec2): Vec2 {
    const x = a[0]
    const y = a[1]
    out[0] = y
    out[1] = -x
    return out
}

/**
 * Transform a point position to local frame.
 * @param out
 * @param worldPoint
 * @param framePosition
 * @param frameAngle
 * @return
 */
export function toLocalFrame(out: Vec2, worldPoint: Vec2, framePosition: Vec2, frameAngle: number): Vec2 {
    const c = Math.cos(-frameAngle),
        s = Math.sin(-frameAngle),
        x = worldPoint[0] - framePosition[0],
        y = worldPoint[1] - framePosition[1]
    out[0] = c * x - s * y
    out[1] = s * x + c * y
    return out
}

/**
 * Transform a point position to global frame.
 * @param out
 * @param localPoint
 * @param framePosition
 * @param frameAngle
 */
export function toGlobalFrame(out: Vec2, localPoint: Vec2, framePosition: Vec2, frameAngle: number) {
    const c = Math.cos(frameAngle),
        s = Math.sin(frameAngle),
        x = localPoint[0],
        y = localPoint[1],
        addX = framePosition[0],
        addY = framePosition[1]
    out[0] = c * x - s * y + addX
    out[1] = s * x + c * y + addY
}

/**
 * Transform a vector to local frame.
 * @param out
 * @param worldVector
 * @param frameAngle
 * @return
 */
export function vectorToLocalFrame(out: Vec2, worldVector: Vec2, frameAngle: number): Vec2 {
    const c = Math.cos(-frameAngle),
        s = Math.sin(-frameAngle),
        x = worldVector[0],
        y = worldVector[1]
    out[0] = c * x - s * y
    out[1] = s * x + c * y
    return out
}

/**
 * Transform a vector to global frame.
 */
export const vectorToGlobalFrame = rotate

/**
 * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
 * @param out
 * @param a
 * @param b
 * @param c
 * @return The "out" vector.
 */
export function centroid(out: Vec2, a: Vec2, b: Vec2, c: Vec2): Vec2 {
    add(out, a, b)
    add(out, out, c)
    scale(out, out, 1 / 3)
    return out
}

/**
 * Creates a new, empty vec2
 * @return a new 2D vector
 */
export function create(): Vec2 {
    const out = new ARRAY_TYPE(2)
    out[0] = 0
    out[1] = 0
    return out as Vec2 | Float32Array
}

/**
 * Creates a new vec2 initialized with values from an existing vector
 * @param a vector to clone
 * @return a new 2D vector
 */
export function clone(a: Vec2): Vec2 {
    const out = new ARRAY_TYPE(2) as Vec2
    out[0] = a[0]
    out[1] = a[1]
    return out
}

/**
 * Creates a new vec2 initialized with the given values
 * @param x X component
 * @param y Y component
 * @return a new 2D vector
 */
export function fromValues(x: number, y: number): Vec2 {
    const out = new ARRAY_TYPE(2) as Vec2
    out[0] = x
    out[1] = y
    return out
}

/**
 * Copy the values from one vec2 to another
 * @param out the receiving vector
 * @param a the source vector
 * @return out
 */
export function copy(out: Vec2, a: Vec2): Vec2 {
    out[0] = a[0]
    out[1] = a[1]
    return out
}

/**
 * Set the components of a vec2 to the given values
 * @param out the receiving vector
 * @param x X component
 * @param y Y component
 * @return out
 */
export function set(out: Vec2, x: number, y: number): Vec2 {
    out[0] = x
    out[1] = y
    return out
}

/**
 * Adds two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */
export function add(out: Vec2, a: Vec2, b: Vec2): Vec2 {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    return out
}

/**
 * Subtracts two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */
export function subtract(out: Vec2, a: Vec2, b: Vec2): Vec2 {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    return out
}

/**
 * Multiplies two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */
export function multiply(out: Vec2, a: Vec2, b: Vec2): Vec2 {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    return out
}

/**
 * Divides two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */
export function divide(out: Vec2, a: Vec2, b: Vec2): Vec2 {
    out[0] = a[0] / b[0]
    out[1] = a[1] / b[1]
    return out
}

/**
 * Scales a vec2 by a scalar number
 * @param out the receiving vector
 * @param a the vector to scale
 * @param b amount to scale the vector by
 * @return out
 */
export function scale(out: Vec2, a: Vec2, b: number): Vec2 {
    out[0] = a[0] * b
    out[1] = a[1] * b
    return out
}

/**
 * Calculates the euclidian distance between two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return distance between a and b
 */
export function distance(a: Vec2, b: Vec2): number {
    const x = b[0] - a[0]
    const y = b[1] - a[1]
    return Math.sqrt(x * x + y * y)
}

/**
 * Calculates the squared euclidian distance between two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return squared distance between a and b
 */
export function squaredDistance(a: Vec2, b: Vec2): number {
    const x = b[0] - a[0]
    const y = b[1] - a[1]
    return x * x + y * y
}

/**
 * Calculates the length of a vec2
 * @param a vector to calculate length of
 * @return length of a
 */
export function length(a: Vec2): number {
    const x = a[0]
    const y = a[1]
    return Math.sqrt(x * x + y * y)
}

/**
 * Calculates the squared length of a vec2
 * @param a vector to calculate squared length of
 * @return squared length of a
 */
export function squaredLength(a: Vec2): number {
    const x = a[0]
    const y = a[1]
    return x * x + y * y
}

/**
 * Negates the components of a vec2
 * @param out the receiving vector
 * @param a vector to negate
 * @return out
 */
export function negate(out: Vec2, a: Vec2): Vec2 {
    out[0] = -a[0]
    out[1] = -a[1]
    return out
}

/**
 * Normalize a vec2
 * @param out the receiving vector
 * @param a vector to normalize
 * @return out
 */
export function normalize(out: Vec2, a: Vec2): Vec2 {
    const x = a[0]
    const y = a[1]
    let len = x * x + y * y
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
    }
    return out
}

/**
 * Calculates the dot product of two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return dot product of a and b
 */
export function dot(a: Vec2, b: Vec2): number {
    return a[0] * b[0] + a[1] * b[1]
}

/**
 * Returns a string representation of a vector
 * @param vec vector to represent as a string
 * @return string representation of the vector
 */
export function str(a: Vec2): string {
    return 'vec2(' + a[0] + ', ' + a[1] + ')'
}

/**
 * Linearly interpolate/mix two vectors.
 * @param out
 * @param a First vector
 * @param b Second vector
 * @param t Lerp factor
 */
export function lerp(out: Vec2, a: Vec2, b: Vec2, t: number): Vec2 {
    const ax = a[0]
    const ay = a[1]
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    return out
}

/**
 * Reflect a vector along a normal.
 * @param out
 * @param vector
 * @param normal
 */
export function reflect(out: Vec2, vector: Vec2, normal: Vec2): Vec2 {
    const dot = vector[0] * normal[0] + vector[1] * normal[1]
    out[0] = vector[0] - 2 * normal[0] * dot
    out[1] = vector[1] - 2 * normal[1] * dot
    return out
}

/**
 * Get the intersection point between two line segments.
 * @param out
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @return True if there was an intersection, otherwise false.
 */
export function getLineSegmentsIntersection(out: Vec2, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): boolean {
    const t = getLineSegmentsIntersectionFraction(p0, p1, p2, p3)
    if (t < 0) {
        return false
    } else {
        out[0] = p0[0] + t * (p1[0] - p0[0])
        out[1] = p0[1] + t * (p1[1] - p0[1])
        return true
    }
}

/**
 * Get the intersection fraction between two line segments. If successful, the intersection is at p0 + t * (p1 - p0)
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @return A number between 0 and 1 if there was an intersection, otherwise -1.
 */
export function getLineSegmentsIntersectionFraction(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): number {
    const s1_x = p1[0] - p0[0]
    const s1_y = p1[1] - p0[1]
    const s2_x = p3[0] - p2[0]
    const s2_y = p3[1] - p2[1]

    const s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y)
    const t = (s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y)
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // Collision detected
        return t
    }
    return -1 // No collision
}
