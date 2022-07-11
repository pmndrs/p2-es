/**
 * The array type to use for internal numeric computations throughout the library.
 * Float32Array is used if it is available, but falls back on Array.
 * If you want to set array type manually, inject it via the global variable P2_ARRAY_TYPE.
 * See example below.
 *
 * @example
 *     <script>
 *         <!-- Inject your preferred array type before loading p2-es -->
 *         P2_ARRAY_TYPE = Array;
 *     </script>
 *     <script src="p2-es.js"></script>
 */
const ARRAY_TYPE = (() => {
  if (typeof P2_ARRAY_TYPE !== 'undefined') {
    return P2_ARRAY_TYPE;
  } else if (typeof Float32Array !== 'undefined') {
    return Float32Array;
  } else {
    return Array;
  }
})();
/**
 * Append the values in array b to the array a.
 * @param a the array to append to
 * @param b the array to append values from
 */

const appendArray = (a, b) => {
  for (let i = 0, len = b.length; i !== len; ++i) {
    a.push(b[i]);
  }
};
/**
 * Garbage free Array.splice(). Does not allocate a new array.
 * @param array
 * @param index
 * @param howmany
 */

const splice = function (array, index, howmany) {
  if (howmany === void 0) {
    howmany = 1;
  }

  const len = array.length - howmany;

  for (let i = index; i < len; i++) {
    array[i] = array[i + howmany];
  }

  array.length = len;
};
/**
 * Remove an element from an array, if the array contains the element.
 * @param array
 * @param element
 */

const arrayRemove = (array, element) => {
  const idx = array.indexOf(element);

  if (idx !== -1) {
    splice(array, idx, 1);
  }
};
/**
 * Extend an object with the properties of another
 * @param a
 * @param b
 */

const extend = (a, b) => {
  return { ...a,
    ...b
  };
};
/**
 * Shallow clone an object. Returns a new object instance with the same properties as the input instance.
 * @param obj
 */

const shallowClone = obj => {
  return extend({}, obj);
};

var Utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ARRAY_TYPE: ARRAY_TYPE,
    appendArray: appendArray,
    splice: splice,
    arrayRemove: arrayRemove,
    extend: extend,
    shallowClone: shallowClone
});

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
 * Make a cross product and only return the z component
 * @param a
 * @param b
 * @return
 */

function crossLength(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}
/**
 * Cross product between a vector and the Z component of a vector
 * @param out
 * @param vec
 * @param zcomp
 * @return
 */

function crossVZ(out, vec, zcomp) {
  rotate(out, vec, -Math.PI / 2); // Rotate according to the right hand rule

  scale(out, out, zcomp); // Scale with z

  return out;
}
/**
 * Cross product between a vector and the Z component of a vector
 * @param out
 * @param zcomp
 * @param vec
 * @return
 */

function crossZV(out, zcomp, vec) {
  rotate(out, vec, Math.PI / 2); // Rotate according to the right hand rule

  scale(out, out, zcomp); // Scale with z

  return out;
}
/**
 * Rotate a vector by an angle
 * @param out
 * @param a
 * @param angle
 * @return
 */

function rotate(out, a, angle) {
  if (angle !== 0) {
    const c = Math.cos(angle),
          s = Math.sin(angle),
          x = a[0],
          y = a[1];
    out[0] = c * x - s * y;
    out[1] = s * x + c * y;
  } else {
    out[0] = a[0];
    out[1] = a[1];
  }

  return out;
}
/**
 * Rotate a vector 90 degrees clockwise
 * @param out
 * @param a
 * @return
 */

function rotate90cw(out, a) {
  const x = a[0];
  const y = a[1];
  out[0] = y;
  out[1] = -x;
  return out;
}
/**
 * Transform a point position to local frame.
 * @param out
 * @param worldPoint
 * @param framePosition
 * @param frameAngle
 * @return
 */

function toLocalFrame(out, worldPoint, framePosition, frameAngle) {
  const c = Math.cos(-frameAngle),
        s = Math.sin(-frameAngle),
        x = worldPoint[0] - framePosition[0],
        y = worldPoint[1] - framePosition[1];
  out[0] = c * x - s * y;
  out[1] = s * x + c * y;
  return out;
}
/**
 * Transform a point position to global frame.
 * @param out
 * @param localPoint
 * @param framePosition
 * @param frameAngle
 */

function toGlobalFrame(out, localPoint, framePosition, frameAngle) {
  const c = Math.cos(frameAngle),
        s = Math.sin(frameAngle),
        x = localPoint[0],
        y = localPoint[1],
        addX = framePosition[0],
        addY = framePosition[1];
  out[0] = c * x - s * y + addX;
  out[1] = s * x + c * y + addY;
}
/**
 * Transform a vector to local frame.
 * @param out
 * @param worldVector
 * @param frameAngle
 * @return
 */

function vectorToLocalFrame(out, worldVector, frameAngle) {
  const c = Math.cos(-frameAngle),
        s = Math.sin(-frameAngle),
        x = worldVector[0],
        y = worldVector[1];
  out[0] = c * x - s * y;
  out[1] = s * x + c * y;
  return out;
}
/**
 * Transform a vector to global frame.
 */

const vectorToGlobalFrame = rotate;
/**
 * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
 * @param out
 * @param a
 * @param b
 * @param c
 * @return The "out" vector.
 */

function centroid(out, a, b, c) {
  add(out, a, b);
  add(out, out, c);
  scale(out, out, 1 / 3);
  return out;
}
/**
 * Creates a new, empty vec2
 * @return a new 2D vector
 */

function create() {
  const out = new ARRAY_TYPE(2);
  out[0] = 0;
  out[1] = 0;
  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 * @param a vector to clone
 * @return a new 2D vector
 */

function clone(a) {
  const out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 * @param x X component
 * @param y Y component
 * @return a new 2D vector
 */

function fromValues(x, y) {
  const out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 * @param out the receiving vector
 * @param a the source vector
 * @return out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 * @param out the receiving vector
 * @param x X component
 * @param y Y component
 * @return out
 */

function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @return out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Scales a vec2 by a scalar number
 * @param out the receiving vector
 * @param a the vector to scale
 * @param b amount to scale the vector by
 * @return out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return distance between a and b
 */

function distance(a, b) {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return squared distance between a and b
 */

function squaredDistance(a, b) {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 * @param a vector to calculate length of
 * @return length of a
 */

function length(a) {
  const x = a[0];
  const y = a[1];
  return Math.sqrt(x * x + y * y);
}
/**
 * Calculates the squared length of a vec2
 * @param a vector to calculate squared length of
 * @return squared length of a
 */

function squaredLength(a) {
  const x = a[0];
  const y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 * @param out the receiving vector
 * @param a vector to negate
 * @return out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Normalize a vec2
 * @param out the receiving vector
 * @param a vector to normalize
 * @return out
 */

function normalize(out, a) {
  const x = a[0];
  const y = a[1];
  let len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
  }

  return out;
}
/**
 * Calculates the dot product of two vec2's
 * @param a the first operand
 * @param b the second operand
 * @return dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Returns a string representation of a vector
 * @param vec vector to represent as a string
 * @return string representation of the vector
 */

function str(a) {
  return 'vec2(' + a[0] + ', ' + a[1] + ')';
}
/**
 * Linearly interpolate/mix two vectors.
 * @param out
 * @param a First vector
 * @param b Second vector
 * @param t Lerp factor
 */

function lerp(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Reflect a vector along a normal.
 * @param out
 * @param vector
 * @param normal
 */

function reflect(out, vector, normal) {
  const dot = vector[0] * normal[0] + vector[1] * normal[1];
  out[0] = vector[0] - 2 * normal[0] * dot;
  out[1] = vector[1] - 2 * normal[1] * dot;
  return out;
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

function getLineSegmentsIntersection(out, p0, p1, p2, p3) {
  const t = getLineSegmentsIntersectionFraction(p0, p1, p2, p3);

  if (t < 0) {
    return false;
  } else {
    out[0] = p0[0] + t * (p1[0] - p0[0]);
    out[1] = p0[1] + t * (p1[1] - p0[1]);
    return true;
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

function getLineSegmentsIntersectionFraction(p0, p1, p2, p3) {
  const s1_x = p1[0] - p0[0];
  const s1_y = p1[1] - p0[1];
  const s2_x = p3[0] - p2[0];
  const s2_y = p3[1] - p2[1];
  const s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
  const t = (s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    // Collision detected
    return t;
  }

  return -1; // No collision
}

var vec2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    crossLength: crossLength,
    crossVZ: crossVZ,
    crossZV: crossZV,
    rotate: rotate,
    rotate90cw: rotate90cw,
    toLocalFrame: toLocalFrame,
    toGlobalFrame: toGlobalFrame,
    vectorToLocalFrame: vectorToLocalFrame,
    vectorToGlobalFrame: vectorToGlobalFrame,
    centroid: centroid,
    create: create,
    clone: clone,
    fromValues: fromValues,
    copy: copy,
    set: set,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    scale: scale,
    distance: distance,
    squaredDistance: squaredDistance,
    length: length,
    squaredLength: squaredLength,
    negate: negate,
    normalize: normalize,
    dot: dot,
    str: str,
    lerp: lerp,
    reflect: reflect,
    getLineSegmentsIntersection: getLineSegmentsIntersection,
    getLineSegmentsIntersectionFraction: getLineSegmentsIntersectionFraction
});

/**
 * Axis aligned bounding box class
 *
 * @example
 *     var aabb = new AABB({
 *         upperBound: [1, 1],
 *         lowerBound: [-1, -1]
 *     });
 */
class AABB {
  /**
   * The upper bound of the bounding box.
   */

  /**
   * The lower bound of the bounding box.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    this.lowerBound = options.lowerBound ? clone(options.lowerBound) : create();
    this.upperBound = options.upperBound ? clone(options.upperBound) : create();
  }
  /**
   * Set the AABB bounds from a set of points, transformed by the given position and angle.
   * @param points An array of vec2's.
   * @param position
   * @param angle
   * @param skinSize Some margin to be added to the AABB.
   */


  setFromPoints(points, position, angle, skinSize) {
    if (angle === void 0) {
      angle = 0;
    }

    if (skinSize === void 0) {
      skinSize = 0;
    }

    const l = this.lowerBound;
    const u = this.upperBound; // Set to the first point

    if (angle !== 0) {
      rotate(l, points[0], angle);
    } else {
      copy(l, points[0]);
    }

    copy(u, l); // Compute cosines and sines just once

    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    for (let i = 1; i < points.length; i++) {
      let p = points[i];

      if (angle !== 0) {
        const x = p[0],
              y = p[1];
        tmp$1[0] = cosAngle * x - sinAngle * y;
        tmp$1[1] = sinAngle * x + cosAngle * y;
        p = tmp$1;
      }

      for (let j = 0; j < 2; j++) {
        if (p[j] > u[j]) {
          u[j] = p[j];
        }

        if (p[j] < l[j]) {
          l[j] = p[j];
        }
      }
    } // Add offset


    if (position) {
      add(l, l, position);
      add(u, u, position);
    }

    if (skinSize) {
      l[0] -= skinSize;
      l[1] -= skinSize;
      u[0] += skinSize;
      u[1] += skinSize;
    }
  }
  /**
   * Copy bounds from an AABB to this AABB
   * @param  {AABB} aabb
   */


  copy(aabb) {
    copy(this.lowerBound, aabb.lowerBound);
    copy(this.upperBound, aabb.upperBound);
  }
  /**
   * Extend this AABB so that it covers the given AABB too.
   * @param aabb
   */


  extend(aabb) {
    const lower = this.lowerBound,
          upper = this.upperBound; // Loop over x and y

    let i = 2;

    while (i--) {
      // Extend lower bound
      const l = aabb.lowerBound[i];

      if (lower[i] > l) {
        lower[i] = l;
      } // Upper


      const u = aabb.upperBound[i];

      if (upper[i] < u) {
        upper[i] = u;
      }
    }
  }
  /**
   * Returns true if the given AABB overlaps this AABB.
   * @param aabb
   * @return
   */


  overlaps(aabb) {
    const l1 = this.lowerBound,
          u1 = this.upperBound,
          l2 = aabb.lowerBound,
          u2 = aabb.upperBound; //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    return (l2[0] <= u1[0] && u1[0] <= u2[0] || l1[0] <= u2[0] && u2[0] <= u1[0]) && (l2[1] <= u1[1] && u1[1] <= u2[1] || l1[1] <= u2[1] && u2[1] <= u1[1]);
  }
  /**
   * Whether the AABB contains a given point
   * @param point
   * @return
   */


  containsPoint(point) {
    const l = this.lowerBound,
          u = this.upperBound;
    return l[0] <= point[0] && point[0] <= u[0] && l[1] <= point[1] && point[1] <= u[1];
  }
  /**
   * Check if the AABB is hit by a ray.
   * @param ray
   * @return -1 if no hit, a number between 0 and 1 if hit, indicating the position between the "from" and "to" points.
   * @example
   *     var aabb = new AABB({
   *         upperBound: [1, 1],
   *         lowerBound: [-1, -1]
   *     });
   *     var ray = new Ray({
   *         from: [-2, 0],
   *         to: [0, 0]
   *     });
   *     var fraction = aabb.overlapsRay(ray); // fraction == 0.5
   */


  overlapsRay(ray) {
    // ray.direction is unit direction vector of ray
    const dirFracX = 1 / ray.direction[0];
    const dirFracY = 1 / ray.direction[1]; // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner

    const from = ray.from;
    const lowerBound = this.lowerBound;
    const upperBound = this.upperBound;
    const t1 = (lowerBound[0] - from[0]) * dirFracX;
    const t2 = (upperBound[0] - from[0]) * dirFracX;
    const t3 = (lowerBound[1] - from[1]) * dirFracY;
    const t4 = (upperBound[1] - from[1]) * dirFracY;
    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4))); // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behind us

    if (tmax < 0) {
      //t = tmax;
      return -1;
    } // if tmin > tmax, ray doesn't intersect AABB


    if (tmin > tmax) {
      //t = tmax;
      return -1;
    }

    return tmin / ray.length;
  }

}
const tmp$1 = create();

const tmpPoint1 = [0, 0];
const tmpPoint2 = [0, 0];
const tmpLine1 = [[0, 0], [0, 0]];
const tmpLine2 = [[0, 0], [0, 0]];
/**
 * Compute the intersection between two lines.
 * @param l1 Line vector 1
 * @param l2 Line vector 2
 * @param precision Precision to use when checking if the lines are parallel
 * @return The intersection point.
 */

function lineInt(l1, l2, precision) {
  if (precision === void 0) {
    precision = 0;
  }

  precision = precision || 0;
  const i = [0, 0]; // point

  const a1 = l1[1][1] - l1[0][1];
  const b1 = l1[0][0] - l1[1][0];
  const c1 = a1 * l1[0][0] + b1 * l1[0][1];
  const a2 = l2[1][1] - l2[0][1];
  const b2 = l2[0][0] - l2[1][0];
  const c2 = a2 * l2[0][0] + b2 * l2[0][1];
  const det = a1 * b2 - a2 * b1;

  if (!scalarsEqual(det, 0, precision)) {
    // lines are not parallel
    i[0] = (b2 * c1 - b1 * c2) / det;
    i[1] = (a1 * c2 - a2 * c1) / det;
  }

  return i;
}
/**
 * Checks if two line segments intersects.
 * @param p1 The start vertex of the first line segment.
 * @param p2 The end vertex of the first line segment.
 * @param q1 The start vertex of the second line segment.
 * @param q2 The end vertex of the second line segment.
 * @return True if the two line segments intersect
 */


function lineSegmentsIntersect(p1, p2, q1, q2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const da = q2[0] - q1[0];
  const db = q2[1] - q1[1]; // segments are parallel

  if (da * dy - db * dx === 0) {
    return false;
  }

  const s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx);
  const t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy);
  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}
/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @param a point 1
 * @param b point 2
 * @param c point 3
 * @return the area of a triangle spanned by the three given points
 */


function triangleArea(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
}

function isLeft(a, b, c) {
  return triangleArea(a, b, c) > 0;
}

function isLeftOn(a, b, c) {
  return triangleArea(a, b, c) >= 0;
}

function isRight(a, b, c) {
  return triangleArea(a, b, c) < 0;
}

function isRightOn(a, b, c) {
  return triangleArea(a, b, c) <= 0;
}
/**
 * Check if three points are collinear
 * @param a point 1
 * @param b point 2
 * @param c point 3
 * @param thresholdAngle angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
 * @return whether the points are collinear
 */


function collinear(a, b, c, thresholdAngle) {
  if (thresholdAngle === void 0) {
    thresholdAngle = 0;
  }

  if (!thresholdAngle) {
    return triangleArea(a, b, c) === 0;
  } else {
    const ab = tmpPoint1;
    const bc = tmpPoint2;
    ab[0] = b[0] - a[0];
    ab[1] = b[1] - a[1];
    bc[0] = c[0] - b[0];
    bc[1] = c[1] - b[1];
    const dot = ab[0] * bc[0] + ab[1] * bc[1];
    const magA = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]);
    const magB = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    const angle = Math.acos(dot / (magA * magB));
    return angle < thresholdAngle;
  }
}

function sqdist(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return dx * dx + dy * dy;
}
/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @param i vertex position
 * @return vertex at position i
 */


function polygonAt(polygon, i) {
  const s = polygon.length;
  return polygon[i < 0 ? i % s + s : i % s];
}
/**
 * Clear the polygon data
 */


function polygonClear(polygon) {
  polygon.length = 0;
}
/**
 * Append points "from" to "to" -1 from an other polygon "poly" onto this one.
 * @param polygon the polygon to append to
 * @param poly The polygon to get points from.
 * @param from The vertex index in "poly".
 * @param to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 */


function polygonAppend(polygon, poly, from, to) {
  for (let i = from; i < to; i++) {
    polygon.push(poly[i]);
  }
}
/**
 * Make sure that the polygon vertices are ordered counter-clockwise.
 */


function makeCCW(polygon) {
  let br = 0;
  const v = polygon; // find bottom right point

  for (let i = 1; i < polygon.length; ++i) {
    if (v[i][1] < v[br][1] || v[i][1] === v[br][1] && v[i][0] > v[br][0]) {
      br = i;
    }
  } // reverse poly if clockwise


  if (!isLeft(polygonAt(polygon, br - 1), polygonAt(polygon, br), polygonAt(polygon, br + 1))) {
    polygonReverse(polygon);
    return true;
  } else {
    return false;
  }
}
/**
 * Reverse the vertices in the polygon
 */

function polygonReverse(polygon) {
  const tmp = [];
  const N = polygon.length;

  for (let i = 0; i !== N; i++) {
    tmp.push(polygon.pop());
  }

  for (let i = 0; i !== N; i++) {
    polygon[i] = tmp[i];
  }
}
/**
 * Check if a point in the polygon is a reflex point
 * @param i the point in the polygon to check
 * @return whether the given point in the polygon is a reflex point
 */


function polygonIsReflex(polygon, i) {
  return isRight(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1));
}
/**
 * Check if two vertices in the polygon can see each other
 * @param a vertex index 1
 * @param b vertex index 2
 * @return whether two vertices in the polygon can see each other
 */


function polygonCanSee(polygon, a, b) {
  const l1 = tmpLine1;
  const l2 = tmpLine2;

  if (isLeftOn(polygonAt(polygon, a + 1), polygonAt(polygon, a), polygonAt(polygon, b)) && isRightOn(polygonAt(polygon, a - 1), polygonAt(polygon, a), polygonAt(polygon, b))) {
    return false;
  }

  const dist = sqdist(polygonAt(polygon, a), polygonAt(polygon, b));

  for (let i = 0; i !== polygon.length; ++i) {
    // for each edge
    if ((i + 1) % polygon.length === a || i === a) {
      // ignore incident edges
      continue;
    }

    if (isLeftOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i + 1)) && isRightOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i))) {
      // if diag intersects an edge
      l1[0] = polygonAt(polygon, a);
      l1[1] = polygonAt(polygon, b);
      l2[0] = polygonAt(polygon, i);
      l2[1] = polygonAt(polygon, i + 1);
      const p = lineInt(l1, l2);

      if (sqdist(polygonAt(polygon, a), p) < dist) {
        // if edge is blocking visibility to b
        return false;
      }
    }
  }

  return true;
}
/**
 * Check if two vertices in the polygon can see each other
 * @param a vertex index 1
 * @param b vertex index 2
 * @return if two vertices in the polygon can see each other
 */


function polygonCanSee2(polygon, a, b) {
  // for each edge
  for (let i = 0; i !== polygon.length; ++i) {
    // ignore incident edges
    if (i === a || i === b || (i + 1) % polygon.length === a || (i + 1) % polygon.length === b) {
      continue;
    }

    if (lineSegmentsIntersect(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i), polygonAt(polygon, i + 1))) {
      return false;
    }
  }

  return true;
}
/**
 * Copy the polygon from vertex i to vertex j.
 * @param i the start vertex to copy from
 * @param j the end vertex to copy from
 * @param targetPoly optional target polygon to save in.
 * @return the resulting copy.
 */


function polygonCopy(polygon, i, j, targetPoly) {
  if (targetPoly === void 0) {
    targetPoly = [];
  }

  polygonClear(targetPoly);

  if (i < j) {
    // Insert all vertices from i to j
    for (let k = i; k <= j; k++) {
      targetPoly.push(polygon[k]);
    }
  } else {
    // Insert vertices 0 to j
    for (let k = 0; k <= j; k++) {
      targetPoly.push(polygon[k]);
    } // Insert vertices i to end


    for (let k = i; k < polygon.length; k++) {
      targetPoly.push(polygon[k]);
    }
  }

  return targetPoly;
}
/**
 * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
 * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
 * @return a list of edges that cuts the polygon
 */


function getCutEdges(polygon) {
  let min = [];
  let tmp1;
  let tmp2;
  const tmpPoly = [];
  let nDiags = Number.MAX_VALUE;

  for (let i = 0; i < polygon.length; ++i) {
    if (polygonIsReflex(polygon, i)) {
      for (let j = 0; j < polygon.length; ++j) {
        if (polygonCanSee(polygon, i, j)) {
          tmp1 = getCutEdges(polygonCopy(polygon, i, j, tmpPoly));
          tmp2 = getCutEdges(polygonCopy(polygon, j, i, tmpPoly));

          for (let k = 0; k < tmp2.length; k++) {
            tmp1.push(tmp2[k]);
          }

          if (tmp1.length < nDiags) {
            min = tmp1;
            nDiags = tmp1.length;
            min.push([polygonAt(polygon, i), polygonAt(polygon, j)]);
          }
        }
      }
    }
  }

  return min;
}
/**
 * Decomposes the polygon into one or more convex sub-Polygons.
 * @return An array of Polygon objects, or false if decomposition fails
 */


function decomp(polygon) {
  const edges = getCutEdges(polygon);

  if (edges.length > 0) {
    return slicePolygon(polygon, edges);
  } else {
    return [polygon];
  }
}
/**
 * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
 * @param cutEdges A list of edges, as returned by .getCutEdges()
 * @return the sliced polygons, or false if the operation was unsuccessful
 */

function slicePolygon(polygon, cutEdges) {
  if (cutEdges.length === 0) {
    return [polygon];
  } // if given multiple edges


  if (cutEdges instanceof Array && cutEdges.length && cutEdges[0] instanceof Array && cutEdges[0].length === 2 && cutEdges[0][0] instanceof Array) {
    const polys = [polygon];

    for (let i = 0; i < cutEdges.length; i++) {
      const cutEdge = cutEdges[i]; // Cut all polys

      for (let j = 0; j < polys.length; j++) {
        const poly = polys[j];
        const result = slicePolygon(poly, cutEdge);

        if (result) {
          // Found poly! Cut and quit
          polys.splice(j, 1);
          polys.push(result[0], result[1]);
          break;
        }
      }
    }

    return polys;
  } else {
    // Was given one edge
    const cutEdge = cutEdges;
    const i = polygon.indexOf(cutEdge[0]);
    const j = polygon.indexOf(cutEdge[1]);

    if (i !== -1 && j !== -1) {
      return [polygonCopy(polygon, i, j), polygonCopy(polygon, j, i)];
    } else {
      return false;
    }
  }
}
/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @param polygon An array of vertices e.g. [[0,0],[0,1],...]
 * @return whether line segments of this polygon do not intersect each other.
 * @todo Should it check all segments with all others?
 */


function isSimple(polygon) {
  const path = polygon;
  let i; // Check

  for (i = 0; i < path.length - 1; i++) {
    for (let j = 0; j < i - 1; j++) {
      if (lineSegmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
        return false;
      }
    }
  } // Check the segment between the last and the first point to all others


  for (i = 1; i < path.length - 2; i++) {
    if (lineSegmentsIntersect(path[0], path[path.length - 1], path[i], path[i + 1])) {
      return false;
    }
  }

  return true;
}

function getIntersectionPoint(p1, p2, q1, q2, delta) {
  if (delta === void 0) {
    delta = 0;
  }

  const a1 = p2[1] - p1[1];
  const b1 = p1[0] - p2[0];
  const c1 = a1 * p1[0] + b1 * p1[1];
  const a2 = q2[1] - q1[1];
  const b2 = q1[0] - q2[0];
  const c2 = a2 * q1[0] + b2 * q1[1];
  const det = a1 * b2 - a2 * b1;

  if (!scalarsEqual(det, 0, delta)) {
    return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
  } else {
    return [0, 0];
  }
}
/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @param polygon the polygon to decompose
 * @param result
 * @param reflexVertices
 * @param steinerPoints
 * @param delta
 * @param maxlevel
 * @param level
 * @return the decomposed sub-polygons
 */


function quickDecomp(polygon, result, reflexVertices, steinerPoints, delta, maxlevel, level) {
  if (result === void 0) {
    result = [];
  }

  if (reflexVertices === void 0) {
    reflexVertices = [];
  }

  if (steinerPoints === void 0) {
    steinerPoints = [];
  }

  if (delta === void 0) {
    delta = 25;
  }

  if (maxlevel === void 0) {
    maxlevel = 100;
  }

  if (level === void 0) {
    level = 0;
  }

  // Points
  let upperInt = [0, 0];
  let lowerInt = [0, 0];
  let p = [0, 0]; // scalars

  let upperDist = 0;
  let lowerDist = 0;
  let d = 0;
  let closestDist = 0; // Integers

  let upperIndex = 0;
  let lowerIndex = 0;
  let closestIndex = 0; // polygons

  const lowerPoly = [];
  const upperPoly = [];
  const poly = polygon;
  const v = polygon;

  if (v.length < 3) {
    return result;
  }

  level++;

  if (level > maxlevel) {
    console.warn('quickDecomp: max level (' + maxlevel + ') reached.');
    return result;
  }

  for (let i = 0; i < polygon.length; ++i) {
    if (polygonIsReflex(poly, i)) {
      reflexVertices.push(poly[i]);
      upperDist = lowerDist = Number.MAX_VALUE;

      for (let j = 0; j < polygon.length; ++j) {
        if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) && isRightOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j - 1))) {
          // if line intersects with an edge
          p = getIntersectionPoint(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j), polygonAt(poly, j - 1)); // find the point of intersection

          if (isRight(polygonAt(poly, i + 1), polygonAt(poly, i), p)) {
            // make sure it's inside the poly
            d = sqdist(poly[i], p);

            if (d < lowerDist) {
              // keep only the closest intersection
              lowerDist = d;
              lowerInt = p;
              lowerIndex = j;
            }
          }
        }

        if (isLeft(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j + 1)) && isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))) {
          p = getIntersectionPoint(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j), polygonAt(poly, j + 1));

          if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), p)) {
            d = sqdist(poly[i], p);

            if (d < upperDist) {
              upperDist = d;
              upperInt = p;
              upperIndex = j;
            }
          }
        }
      } // if there are no vertices to connect to, choose a point in the middle


      if (lowerIndex === (upperIndex + 1) % polygon.length) {
        p[0] = (lowerInt[0] + upperInt[0]) / 2;
        p[1] = (lowerInt[1] + upperInt[1]) / 2;
        steinerPoints.push(p);

        if (i < upperIndex) {
          polygonAppend(lowerPoly, poly, i, upperIndex + 1);
          lowerPoly.push(p);
          upperPoly.push(p);

          if (lowerIndex !== 0) {
            polygonAppend(upperPoly, poly, lowerIndex, poly.length);
          }

          polygonAppend(upperPoly, poly, 0, i + 1);
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, poly.length);
          }

          polygonAppend(lowerPoly, poly, 0, upperIndex + 1);
          lowerPoly.push(p);
          upperPoly.push(p);
          polygonAppend(upperPoly, poly, lowerIndex, i + 1);
        }
      } else {
        // connect to the closest point within the triangle
        if (lowerIndex > upperIndex) {
          upperIndex += polygon.length;
        }

        closestDist = Number.MAX_VALUE;

        if (upperIndex < lowerIndex) {
          return result;
        }

        for (let j = lowerIndex; j <= upperIndex; ++j) {
          if (isLeftOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) && isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))) {
            d = sqdist(polygonAt(poly, i), polygonAt(poly, j));

            if (d < closestDist && polygonCanSee2(poly, i, j)) {
              closestDist = d;
              closestIndex = j % polygon.length;
            }
          }
        }

        if (i < closestIndex) {
          polygonAppend(lowerPoly, poly, i, closestIndex + 1);

          if (closestIndex !== 0) {
            polygonAppend(upperPoly, poly, closestIndex, v.length);
          }

          polygonAppend(upperPoly, poly, 0, i + 1);
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, v.length);
          }

          polygonAppend(lowerPoly, poly, 0, closestIndex + 1);
          polygonAppend(upperPoly, poly, closestIndex, i + 1);
        }
      } // solve smallest poly first


      if (lowerPoly.length < upperPoly.length) {
        quickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
        quickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
      } else {
        quickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
        quickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
      }

      return result;
    }
  }

  result.push(polygon);
  return result;
}
/**
 * Remove collinear points in the polygon.
 * @param thresholdAngle The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
 * @return The number of points removed
 */

function removeCollinearPoints(polygon, thresholdAngle) {
  if (thresholdAngle === void 0) {
    thresholdAngle = 0;
  }

  let num = 0;

  for (let i = polygon.length - 1; polygon.length > 3 && i >= 0; --i) {
    if (collinear(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1), thresholdAngle)) {
      // Remove the middle point
      polygon.splice(i % polygon.length, 1);
      num++;
    }
  }

  return num;
}
/**
 * Check if two scalars are equal
 * @param a scalar a
 * @param b scalar b
 * @param precision the precision for the equality check
 * @return whether the two scalars are equal with the given precision
 */

function scalarsEqual(a, b, precision) {
  if (precision === void 0) {
    precision = 0;
  }

  precision = precision || 0;
  return Math.abs(a - b) <= precision;
}

/**
 * A line with a start and end point that is used to intersect shapes.
 * @see {@link World.raycast} for example usage
 */
class Ray {
  /**
   * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
   */

  /**
   * This raycasting mode will make the Ray stop when it finds the first intersection point.
   */

  /**
   * This raycasting mode will traverse all intersection points and executes a callback for each one.
   */

  /**
   * The direction of the ray
   */

  /**
   * Length of the ray
   */

  /**
   * Constructor for a new Ray
   * @param options
   */
  constructor(options) {
    var _options;

    if (options === void 0) {
      options = {};
    }

    this.direction = create();
    this.length = 1;
    this._currentBody = null;
    this._currentShape = null;
    this.from = options.from ? clone(options.from) : create();
    this.to = options.to ? clone(options.to) : create();
    this.checkCollisionResponse = options.checkCollisionResponse ?? true;
    this.skipBackfaces = !!options.skipBackfaces;
    this.collisionMask = options.collisionMask ?? -1;
    this.collisionGroup = options.collisionGroup ?? -1;
    this.mode = options.mode ?? Ray.ANY; // eslint-disable-next-line @typescript-eslint/no-empty-function

    this.callback = ((_options = options) == null ? void 0 : _options.callback) || function
      /*result*/
    () {};

    this.update();
  }
  /**
   * Should be called if you change the from or to point.
   */


  update() {
    // Update .direction and .length
    const d = this.direction;
    subtract(d, this.to, this.from);
    this.length = length(d);
    normalize(d, d);
  }
  /**
   * @param bodies An array of Body objects.
   */


  intersectBodies(result, bodies) {
    for (let i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
      const body = bodies[i];
      const aabb = body.getAABB();

      if (aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)) {
        this.intersectBody(result, body);
      }
    }
  }
  /**
   * Shoot a ray at a body, get back information about the hit.
   * @param body
   */


  intersectBody(result, body) {
    const checkCollisionResponse = this.checkCollisionResponse;

    if (checkCollisionResponse && !body.collisionResponse) {
      return;
    }

    const worldPosition = intersectBody_worldPosition;

    for (let i = 0, N = body.shapes.length; i < N; i++) {
      const shape = body.shapes[i];

      if (checkCollisionResponse && !shape.collisionResponse) {
        continue; // Skip
      }

      if ((this.collisionGroup & shape.collisionMask) === 0 || (shape.collisionGroup & this.collisionMask) === 0) {
        continue;
      } // Get world angle and position of the shape


      rotate(worldPosition, shape.position, body.angle);
      add(worldPosition, worldPosition, body.position);
      const worldAngle = shape.angle + body.angle;
      this.intersectShape(result, shape, worldAngle, worldPosition, body);

      if (result.shouldStop(this)) {
        break;
      }
    }
  }
  /**
   * Shoot a ray at a shape, get back information about the hit
   * @param shape
   * @param angle
   * @param position
   * @param body
   */


  intersectShape(result, shape, angle, position, body) {
    const from = this.from; // Checking radius

    const distance = distanceFromIntersectionSquared(from, this.direction, position);

    if (distance > shape.boundingRadius * shape.boundingRadius) {
      return;
    }

    this._currentBody = body;
    this._currentShape = shape;
    shape.raycast(result, this, position, angle);
    this._currentBody = this._currentShape = null;
  }
  /**
   * Get the AABB of the ray.
   * @param aabb
   */


  getAABB(result) {
    const to = this.to;
    const from = this.from;
    set(result.lowerBound, Math.min(to[0], from[0]), Math.min(to[1], from[1]));
    set(result.upperBound, Math.max(to[0], from[0]), Math.max(to[1], from[1]));
  }
  /**
   * @param fraction
   * @param normal
   * @param faceIndex
   */


  reportIntersection(result, fraction, normal, faceIndex) {
    if (faceIndex === void 0) {
      faceIndex = -1;
    }

    const shape = this._currentShape;
    const body = this._currentBody; // Skip back faces?

    if (this.skipBackfaces && dot(normal, this.direction) > 0) {
      return;
    }

    switch (this.mode) {
      case Ray.ALL:
        result.set(normal, shape, body, fraction, faceIndex);
        this.callback(result);
        break;

      case Ray.CLOSEST:
        // Store if closer than current closest
        if (fraction < result.fraction || !result.hasHit()) {
          result.set(normal, shape, body, fraction, faceIndex);
        }

        break;

      case Ray.ANY:
        // Report and stop.
        result.set(normal, shape, body, fraction, faceIndex);
        break;
    }
  }

}
Ray.CLOSEST = 1;
Ray.ANY = 2;
Ray.ALL = 4;
const v0 = create();
const intersect = create();

function distanceFromIntersectionSquared(from, direction, position) {
  // v0 is vector from from to position
  subtract(v0, position, from);
  const dot$1 = dot(v0, direction); // intersect = direction * dot + from

  scale(intersect, direction, dot$1);
  add(intersect, intersect, from);
  return squaredDistance(position, intersect);
}

const intersectBody_worldPosition = create();

/**
 * Storage for Ray casting hit data.
 */

class RaycastResult {
  /**
   * The normal of the hit, oriented in world space.
   */

  /**
   * The hit shape, or null.
   */

  /**
   * The hit body, or null.
   */

  /**
   * The index of the hit triangle, if the hit shape was indexable.
   * @default -1
   */

  /**
   * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
   * @default -1
   */

  /**
   * If the ray should stop traversing.
   */
  constructor() {
    this.normal = create();
    this.shape = null;
    this.body = null;
    this.faceIndex = -1;
    this.fraction = -1;
    this.isStopped = false;
  }
  /**
   * Reset all result data. Must be done before re-using the result object.
   */


  reset() {
    set(this.normal, 0, 0);
    this.shape = null;
    this.body = null;
    this.faceIndex = -1;
    this.fraction = -1;
    this.isStopped = false;
  }
  /**
   * Get the distance to the hit point.
   * @param ray
   * @return
   */


  getHitDistance(ray) {
    return distance(ray.from, ray.to) * this.fraction;
  }
  /**
   * Returns true if the ray hit something since the last reset().
   * @return
   */


  hasHit() {
    return this.fraction !== -1;
  }
  /**
   * Get world hit point.
   * @param out
   * @param ray
   */


  getHitPoint(out, ray) {
    return lerp(out, ray.from, ray.to, this.fraction);
  }
  /**
   * Can be called while iterating over hits to stop searching for hit points.
   */


  stop() {
    this.isStopped = true;
  }

  shouldStop(ray) {
    return this.isStopped || this.fraction !== -1 && ray.mode === Ray.ANY;
  }

  set(normal, shape, body, fraction, faceIndex) {
    copy(this.normal, normal);
    this.shape = shape;
    this.body = body;
    this.fraction = fraction;
    this.faceIndex = faceIndex;
  }

}

/* eslint-disable @typescript-eslint/ban-types */

/**
 * Base class for objects that dispatches events.
 *
 * @example
 *     var emitter = new EventEmitter();
 *     emitter.on('myEvent', function(evt){
 *         console.log(evt.message);
 *     });
 *     emitter.emit({
 *         type: 'myEvent',
 *         message: 'Hello world!'
 *     });
 */
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Add an event listener
   * @param type
   * @param listener
   * @return The self object, for chainability.
   * @example
   *     emitter.on('myEvent', function(evt){
   *         console.log('myEvt was triggered!');
   *     });
   */
  on(type, listener, context) {
    listener.context = context || this;
    let listeners = this.listeners[type];

    if (listeners === undefined) {
      listeners = [];
      this.listeners[type] = listeners;
    }

    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }

    return this;
  }
  /**
   * Remove an event listener
   * @param type
   * @param listener
   * @return The self object, for chainability.
   * @example
   *     emitter.on('myEvent', handler); // Add handler
   *     emitter.off('myEvent', handler); // Remove handler
   */


  off(type, listener) {
    const listeners = this.listeners[type];

    if (listeners) {
      const index = listeners.indexOf(listener);

      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    return this;
  }
  /**
   * Check if an event listener is added
   * @param type
   * @param listener
   * @return
   */


  has(type, listener) {
    if (this.listeners === undefined) {
      return false;
    }

    const listeners = this.listeners[type];

    if (listener) {
      if (listeners !== undefined && listeners.indexOf(listener) !== -1) {
        return true;
      }
    } else {
      if (listeners !== undefined) {
        return true;
      }
    }

    return false;
  }
  /**
   * Emit an event.
   * @param event
   * @param event.type
   * @return The self object, for chainability.
   * @example
   *     emitter.emit({
   *         type: 'myEvent',
   *         customData: 123
   *     });
   */


  emit(event) {
    if (this.listeners === undefined) {
      return this;
    }

    const eventListeners = this.listeners[event.type];

    if (eventListeners !== undefined) {
      const toEmit = { ...event,
        target: this
      }; // only emit to current listeners, ignore listeners that might be added inside a listener function

      for (const listener of [...eventListeners]) {
        listener.call(listener.context, toEmit);
      }
    }

    return this;
  }

}

/*
    PolyK library
    url: http://polyk.ivank.net
    Released under MIT licence.

    Copyright (c) 2012 Ivan Kuckir

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
function triangulate(p) {
  const n = p.length >> 1;
  if (n < 3) return [];
  const tgs = [];
  const avl = [];

  for (let i = 0; i < n; i++) avl.push(i);

  let i = 0;
  let al = n;

  while (al > 3) {
    const i0 = avl[(i + 0) % al];
    const i1 = avl[(i + 1) % al];
    const i2 = avl[(i + 2) % al];
    const ax = p[2 * i0],
          ay = p[2 * i0 + 1];
    const bx = p[2 * i1],
          by = p[2 * i1 + 1];
    const cx = p[2 * i2],
          cy = p[2 * i2 + 1];
    let earFound = false;

    if (convex(ax, ay, bx, by, cx, cy)) {
      earFound = true;

      for (let j = 0; j < al; j++) {
        const vi = avl[j];
        if (vi == i0 || vi == i1 || vi == i2) continue;

        if (pointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
          earFound = false;
          break;
        }
      }
    }

    if (earFound) {
      tgs.push(i0, i1, i2);
      avl.splice((i + 1) % al, 1);
      al--;
      i = 0;
    } else if (i++ > 3 * al) break; // no convex angles :(

  }

  tgs.push(avl[0], avl[1], avl[2]);
  return tgs;
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = px - ax;
  const v2y = py - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom; // Check if point is in triangle

  return u >= 0 && v >= 0 && u + v < 1;
}

function convex(ax, ay, bx, by, cx, cy) {
  return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0;
}

/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Base class for shapes. Not to be used directly.
 */
class Shape {
  /**
   * The body this shape is attached to. A shape can only be attached to a single body.
   */

  /**
   * Body-local position of the shape.
   */

  /**
   * Bounding circle radius of this shape
   */

  /**
   * Area of this shape.
   */

  /**
   * ID counter for shapes
   */

  /**
   * Circle shape type
   */

  /**
   * Particle shape type
   */

  /**
   * Plane shape type
   */

  /**
   * Convex shape type
   */

  /**
   * Line shape type
   */

  /**
   * Box shape type
   */

  /**
   * Capsule shape type
   */

  /**
   * Heightfield shape type
   */

  /**
   * Constructor for a Shape
   * @param options
   */
  constructor(options) {
    this.body = null;
    this.position = create();
    this.boundingRadius = 0;
    this.area = 0;
    this.id = Shape.idCounter++;
    this.body = null;

    if (options.position) {
      copy(this.position, options.position);
    }

    this.type = options.type;
    this.angle = options.angle ?? 0;
    this.collisionGroup = options.collisionGroup ?? 1;
    this.collisionResponse = options.collisionResponse ?? true;
    this.collisionMask = options.collisionMask ?? 1;
    this.sensor = options.sensor ?? false;
    this.material = options.material ?? null;
  }
  /**
   * Should return the moment of inertia around the Z axis of the body.
   * See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
   * @return If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
   */


  /**
   * Updates the bounding circle radius of this shape.
   */
  updateBoundingRadius() {}
  /**
   * Update the .area property of the shape.
   */


  updateArea() {}
  /**
   * Perform raycasting on this shape.
   * @param result Where to store the resulting data.
   * @param ray The Ray that you want to use for raycasting.
   * @param position World position of the shape (the .position property will be ignored).
   * @param angle World angle of the shape (the .angle property will be ignored).
   */


  raycast(_result, _ray, _position, _angle) {}
  /**
   * Test if a point is inside this shape.
   * @param _localPoint
   * @return whether a point is inside this shape
   */


  pointTest(_localPoint) {
    return false;
  }
  /**
   * Transform a world point to local shape space (assumed the shape is transformed by both itself and the body).
   * @param out
   * @param worldPoint
   */


  worldPointToLocal(out, worldPoint) {
    const body = this.body;
    rotate(shapeWorldPosition, this.position, body.angle);
    add(shapeWorldPosition, shapeWorldPosition, body.position);
    toLocalFrame(out, worldPoint, shapeWorldPosition, this.body.angle + this.angle);
    return out;
  }

}
Shape.idCounter = 0;
Shape.CIRCLE = 1;
Shape.PARTICLE = 2;
Shape.PLANE = 4;
Shape.CONVEX = 8;
Shape.LINE = 16;
Shape.BOX = 32;
Shape.CAPSULE = 64;
Shape.HEIGHTFIELD = 128;
const shapeWorldPosition = create();

/**
 * Convex shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
 *     var convexShape = new Convex({
 *         vertices: vertices
 *     });
 *     body.addShape(convexShape);
 */
class Convex extends Shape {
  /**
   * Vertices defined in the local frame.
   */

  /**
   * Axes
   */

  /**
   * Edge normals defined in the local frame, pointing out of the shape.
   */

  /**
   * The center of mass of the Convex
   */

  /**
   * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
   */

  /**
   * The bounding radius of the convex
   */

  /**
   * Constructor for Convex shape
   * @param options
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: options.type ?? Shape.CONVEX,
      vertices: options.vertices ?? [],
      axes: options.axes ?? []
    };
    super(params);
    this.axes = params.axes; // Copy the verts

    this.vertices = [];

    for (let i = 0; i < params.vertices.length; i++) {
      this.vertices.push(clone(params.vertices[i]));
    }

    this.normals = [];

    for (let i = 0; i < params.vertices.length; i++) {
      this.normals.push(create());
    }

    this.updateNormals();
    this.centerOfMass = create();
    this.triangles = [];

    if (this.vertices.length) {
      this.updateTriangles();
      this.updateCenterOfMass();
    }

    this.boundingRadius = 0;
    this.updateBoundingRadius();
    this.updateArea();

    if (this.area < 0) {
      throw new Error('Convex vertices must be given in counter-clockwise winding.');
    }
  }

  updateNormals() {
    for (let i = 0; i < this.vertices.length; i++) {
      const worldPoint0 = this.vertices[i];
      const worldPoint1 = this.vertices[(i + 1) % this.vertices.length];
      const normal = this.normals[i];
      subtract(normal, worldPoint1, worldPoint0); // Get normal - just rotate 90 degrees since vertices are given in CCW

      rotate90cw(normal, normal);
      normalize(normal, normal);
    }
  }
  /**
   * Project a Convex onto a world-oriented axis
   * @param offset
   * @param localAxis
   * @param result
   */


  projectOntoLocalAxis(localAxis, result) {
    let max = 0;
    let min = 0;
    localAxis = tmpVec1; // Get projected position of all vertices

    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      const value = dot(v, localAxis);

      if (max === null || value > max) {
        max = value;
      }

      if (min === null || value < min) {
        min = value;
      }
    }

    if (min > max) {
      const t = min;
      min = max;
      max = t;
    }

    set(result, min, max);
  }

  projectOntoWorldAxis(localAxis, shapeOffset, shapeAngle, result) {
    let worldAxis = tmpVec2;
    this.projectOntoLocalAxis(localAxis, result); // Project the position of the body onto the axis - need to add this to the result

    if (shapeAngle !== 0) {
      rotate(worldAxis, localAxis, shapeAngle);
    } else {
      worldAxis = localAxis;
    }

    const offset = dot(shapeOffset, worldAxis);
    set(result, result[0] + offset, result[1] + offset);
  }
  /**
   * Update the .triangles property
   */


  updateTriangles() {
    this.triangles.length = 0; // Rewrite on polyk notation, array of numbers

    const polykVerts = [];

    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      polykVerts.push(v[0], v[1]);
    } // Triangulate


    const triangles = triangulate(polykVerts); // Loop over all triangles, add their inertia contributions to I

    for (let i = 0; i < triangles.length; i += 3) {
      const id1 = triangles[i],
            id2 = triangles[i + 1],
            id3 = triangles[i + 2]; // Add to triangles

      this.triangles.push([id1, id2, id3]);
    }
  }
  /**
   * Update the .centerOfMass property.
   */


  updateCenterOfMass() {
    const triangles = this.triangles,
          verts = this.vertices,
          cm = this.centerOfMass,
          centroid$1 = updateCenterOfMass_centroid;
    let a = updateCenterOfMass_a,
        b = updateCenterOfMass_b,
        c = updateCenterOfMass_c;
    const centroid_times_mass = updateCenterOfMass_centroid_times_mass;
    set(cm, 0, 0);
    let totalArea = 0;

    for (let i = 0; i !== triangles.length; i++) {
      const t = triangles[i];
      a = verts[t[0]], b = verts[t[1]], c = verts[t[2]];
      centroid(centroid$1, a, b, c); // Get mass for the triangle (density=1 in this case)
      // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors

      const m = Convex.triangleArea(a, b, c);
      totalArea += m; // Add to center of mass

      scale(centroid_times_mass, centroid$1, m);
      add(cm, cm, centroid_times_mass);
    }

    scale(cm, cm, 1 / totalArea);
  }
  /**
   * Compute the moment of inertia of the Convex.
   * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
   */


  computeMomentOfInertia() {
    let denom = 0.0,
        numer = 0.0;
    const N = this.vertices.length;

    for (let j = N - 1, i = 0; i < N; j = i, i++) {
      const p0 = this.vertices[j];
      const p1 = this.vertices[i];
      const a = Math.abs(crossLength(p0, p1));
      const b = dot(p1, p1) + dot(p1, p0) + dot(p0, p0);
      denom += a * b;
      numer += a;
    }

    return 1.0 / 6.0 * (denom / numer);
  }
  /**
   * Updates the .boundingRadius property
   */


  updateBoundingRadius() {
    const verts = this.vertices;
    let r2 = 0;

    for (let i = 0; i !== verts.length; i++) {
      const l2 = squaredLength(verts[i]);

      if (l2 > r2) {
        r2 = l2;
      }
    }

    this.boundingRadius = Math.sqrt(r2);
  }
  /**
   * Update the .area
   */


  updateArea() {
    this.updateTriangles();
    this.area = 0;
    const triangles = this.triangles,
          verts = this.vertices;

    for (let i = 0; i !== triangles.length; i++) {
      const t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]]; // Get mass for the triangle (density=1 in this case)

      const m = Convex.triangleArea(a, b, c);
      this.area += m;
    }
  } // todo - approximate with a local AABB?


  computeAABB(out, position, angle) {
    out.setFromPoints(this.vertices, position, angle, 0);
  }
  /**
   * raycast
   * @param result
   * @param ray
   * @param position
   * @param angle
   */


  raycast(result, ray, position, angle) {
    const rayStart = intersectConvex_rayStart;
    const rayEnd = intersectConvex_rayEnd;
    const normal = intersectConvex_normal;
    const vertices = this.vertices; // Transform to local shape space

    toLocalFrame(rayStart, ray.from, position, angle);
    toLocalFrame(rayEnd, ray.to, position, angle);
    const n = vertices.length;

    for (let i = 0; i < n && !result.shouldStop(ray); i++) {
      const q1 = vertices[i];
      const q2 = vertices[(i + 1) % n];
      const delta = getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2);

      if (delta >= 0) {
        subtract(normal, q2, q1);
        rotate(normal, normal, -Math.PI / 2 + angle);
        normalize(normal, normal);
        ray.reportIntersection(result, delta, normal, i);
      }
    }
  }

  pointTest(localPoint) {
    const r0 = pic_r0,
          r1 = pic_r1,
          verts = this.vertices,
          numVerts = verts.length;
    let lastCross = null;

    for (let i = 0; i < numVerts + 1; i++) {
      const v0 = verts[i % numVerts],
            v1 = verts[(i + 1) % numVerts];
      subtract(r0, v0, localPoint);
      subtract(r1, v1, localPoint);
      const cross = crossLength(r0, r1);

      if (lastCross === null) {
        lastCross = cross;
      } // If we got a different sign of the distance vector, the point is out of the polygon


      if (cross * lastCross < 0) {
        return false;
      }

      lastCross = cross;
    }

    return true;
  }
  /**
   * Get the area of the triangle spanned by the three points a, b, c.
   * The area is positive if the points are given in counter-clockwise order, otherwise negative.
   * @param a
   * @param b
   * @param c
   * @return
   */


  static triangleArea(a, b, c) {
    return ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) * 0.5;
  }

}
const tmpVec1 = create();
const tmpVec2 = create();
const updateCenterOfMass_centroid = create();
const updateCenterOfMass_centroid_times_mass = create();
const updateCenterOfMass_a = create();
const updateCenterOfMass_b = create();
const updateCenterOfMass_c = create();
const intersectConvex_rayStart = create();
const intersectConvex_rayEnd = create();
const intersectConvex_normal = create();
const pic_r0 = create();
const pic_r1 = create();

/**
 * A rigid body. Has got a center of mass, position, velocity and a number of
 * shapes that are used for collisions.
 *
 * @example
 *     // Create a typical dynamic body
 *     var body = new Body({
 *         mass: 1, // non-zero mass will set type to Body.DYNAMIC
 *         position: [0, 5],
 *         angle: 0,
 *         velocity: [0, 0],
 *         angularVelocity: 0
 *     });
 *
 *     // Add a circular shape to the body
 *     var circleShape = new Circle({ radius: 0.5 });
 *     body.addShape(circleShape);
 *
 *     // Add the body to the world
 *     world.addBody(body);
 *
 * @example
 *     // Create a static plane body
 *     var planeBody = new Body({
 *         mass: 0, // zero mass will set type to Body.STATIC
 *         position: [0, 0]
 *     });
 *     var planeShape = new Plane();
 *     planeBody.addShape(planeShape);
 *     world.addBody(planeBody);
 *
 * @example
 *     // Create a moving kinematic box body
 *     var platformBody = new Body({
 *         type: Body.KINEMATIC,
 *         position: [0, 3],
 *         velocity: [1, 0]
 *     });
 *     var boxShape = new Box({ width: 2, height: 0.5 });
 *     platformBody.addShape(boxShape);
 *     world.addBody(platformBody);
 */
class Body extends EventEmitter {
  /**
   * Dynamic body.
   */

  /**
   * Static body.
   */

  /**
   * Kinematic body.
   */

  /**
   * Awake sleep state.
   */

  /**
   * Sleepy sleep state.
   */

  /**
   * Sleeping sleep state.
   */

  /**
   * Id counter for Body instances
   */

  /**
   * The world that this body is added to (read only). This property is set to NULL if the body is not added to any world.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    super();
    this.world = null;
    this.id = options.id || ++Body._idCounter;
    this.index = -1;
    this.shapes = [];
    this.mass = options.mass || 0;
    this.invMass = 0;
    this.inertia = 0;
    this.invInertia = 0;
    this.invMassSolve = 0;
    this.invInertiaSolve = 0;
    this.fixedRotation = !!options.fixedRotation;
    this.fixedX = !!options.fixedX;
    this.fixedY = !!options.fixedY;
    this.massMultiplier = create();
    this.position = options.position ? clone(options.position) : create();
    this.interpolatedPosition = clone(this.position);
    this.previousPosition = clone(this.position);
    this.velocity = options.velocity ? clone(options.velocity) : create();
    this.vlambda = create();
    this.wlambda = 0;
    this.angle = options.angle || 0;
    this.previousAngle = this.angle;
    this.interpolatedAngle = this.angle;
    this.angularVelocity = options.angularVelocity || 0;
    this.force = options.force ? clone(options.force) : create();
    this.angularForce = options.angularForce || 0;
    this.damping = options.damping ?? 0.1;
    this.angularDamping = options.angularDamping ?? 0.1;
    this.type = Body.STATIC;

    if (options.type !== undefined) {
      this.type = options.type;
    } else if (!options.mass) {
      this.type = Body.STATIC;
    } else {
      this.type = Body.DYNAMIC;
    }

    this.boundingRadius = 0;
    this.aabb = new AABB();
    this.aabbNeedsUpdate = true;
    this.allowSleep = options.allowSleep ?? true;
    this.wantsToSleep = false;
    this.sleepState = Body.AWAKE;
    this.sleepSpeedLimit = options.sleepSpeedLimit ?? 0.2;
    this.sleepTimeLimit = options.sleepTimeLimit ?? 1;
    this.idleTime = 0;
    this.timeLastSleepy = 0;
    this.collisionResponse = options.collisionResponse ?? true;
    this.ccdSpeedThreshold = options.ccdSpeedThreshold ?? -1;
    this.ccdIterations = options.ccdIterations ?? 10;
    this.gravityScale = options.gravityScale ?? 1;
    this.islandId = -1;
    this.concavePath = null;
    this._wakeUpAfterNarrowphase = false;
    this.updateMassProperties();
  }

  updateSolveMassProperties() {
    if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
      this.invMassSolve = 0;
      this.invInertiaSolve = 0;
    } else {
      this.invMassSolve = this.invMass;
      this.invInertiaSolve = this.invInertia;
    }
  }
  /**
   * Set the total density of the body
   * @param density
   */


  setDensity(density) {
    const totalArea = this.getArea();
    this.mass = totalArea * density;
    this.updateMassProperties();
  }
  /**
   * Get the total area of all shapes in the body
   * @returns total area of all shapes in the body
   */


  getArea() {
    let totalArea = 0;

    for (let i = 0; i < this.shapes.length; i++) {
      totalArea += this.shapes[i].area;
    }

    return totalArea;
  }
  /**
   * Get the AABB from the body. The AABB is updated if necessary.
   * @return The AABB instance from the body.
   */


  getAABB() {
    if (this.aabbNeedsUpdate) {
      this.updateAABB();
    }

    return this.aabb;
  }
  /**
   * Updates the AABB of the Body, and set .aabbNeedsUpdate = false.
   */


  updateAABB() {
    const shapes = this.shapes,
          N = shapes.length,
          offset = updateAABB_tmp,
          bodyAngle = this.angle;

    for (let i = 0; i !== N; i++) {
      const shape = shapes[i],
            angle = shape.angle + bodyAngle; // Get shape world offset

      toGlobalFrame(offset, shape.position, this.position, bodyAngle); // Get shape AABB

      shape.computeAABB(updateAABB_shapeAABB, offset, angle);

      if (i === 0) {
        this.aabb.copy(updateAABB_shapeAABB);
      } else {
        this.aabb.extend(updateAABB_shapeAABB);
      }
    }

    this.aabbNeedsUpdate = false;
  }
  /**
   * Update the bounding radius of the body (this.boundingRadius). Should be done if any of the shape dimensions or positions are changed.
   */


  updateBoundingRadius() {
    const shapes = this.shapes;
    const N = shapes.length;
    let radius = 0;

    for (let i = 0; i !== N; i++) {
      const shape = shapes[i],
            offset = length(shape.position),
            r = shape.boundingRadius;

      if (offset + r > radius) {
        radius = offset + r;
      }
    }

    this.boundingRadius = radius;
  }
  /**
   * Add a shape to the body. You can pass a local transform when adding a shape,
   * so that the shape gets an offset and angle relative to the body center of mass.
   * Will automatically update the mass properties and bounding radius.
   *
   * @param shape
   * @param offset Local body offset of the shape.
   * @param angle Local body angle.
   *
   * @example
   *     var body = new Body(),
   *         shape = new Circle({ radius: 1 });
   *
   *     // Add the shape to the body, positioned in the center
   *     body.addShape(shape);
   *
   *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
   *     body.addShape(shape,[1,0]);
   *
   *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
   *     body.addShape(shape,[0,1],Math.PI/2);
   */


  addShape(shape, offset, angle) {
    if (shape.body) {
      throw new Error('A shape can only be added to one body.');
    }

    const world = this.world;

    if (world && world.stepping) {
      throw new Error('A shape cannot be added during step.');
    }

    shape.body = this; // Copy the offset vector

    if (offset) {
      copy(shape.position, offset);
    } else {
      set(shape.position, 0, 0);
    }

    shape.angle = angle || 0;
    this.shapes.push(shape);
    this.updateMassProperties();
    this.updateBoundingRadius();
    this.aabbNeedsUpdate = true;
  }
  /**
   * Remove a shape.
   * @param shape
   * @return True if the shape was found and removed, else false.
   */


  removeShape(shape) {
    const world = this.world;

    if (world && world.stepping) {
      throw new Error('A shape cannot be removed during step.');
    }

    const idx = this.shapes.indexOf(shape);

    if (idx !== -1) {
      this.shapes.splice(idx, 1);
      this.aabbNeedsUpdate = true;
      shape.body = null;
      return true;
    } else {
      return false;
    }
  }
  /**
   * Updates .inertia, .invMass, .invInertia for this Body. Should be called when changing the structure or mass of the Body.
   *
   * @example
   *     body.mass += 1;
   *     body.updateMassProperties();
   */


  updateMassProperties() {
    if (this.type === Body.STATIC || this.type === Body.KINEMATIC) {
      this.mass = Number.MAX_VALUE;
      this.invMass = 0;
      this.inertia = Number.MAX_VALUE;
      this.invInertia = 0;
    } else {
      const shapes = this.shapes;
      const N = shapes.length;
      let I = 0;

      if (!this.fixedRotation) {
        for (let i = 0; i < N; i++) {
          const shape = shapes[i],
                r2 = squaredLength(shape.position),
                Icm = shape.computeMomentOfInertia();
          I += Icm + r2;
        }

        this.inertia = this.mass * I;
        this.invInertia = I > 0 ? 1 / I : 0;
      } else {
        this.inertia = Number.MAX_VALUE;
        this.invInertia = 0;
      } // Inverse mass properties are easy


      this.invMass = 1 / this.mass;
      set(this.massMultiplier, this.fixedX ? 0 : 1, this.fixedY ? 0 : 1);
    }
  }
  /**
   * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
   * @param force The force vector to add, oriented in world space.
   * @param relativePoint A point relative to the body in world space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
   * @example
   *     var body = new Body({ mass: 1 });
   *     var relativePoint = [1, 0]; // Will apply the force at [body.position[0] + 1, body.position[1]]
   *     var force = [0, 1]; // up
   *     body.applyForce(force, relativePoint);
   *     console.log(body.force); // [0, 1]
   *     console.log(body.angularForce); // 1
   */


  applyForce(force, relativePoint) {
    // Add linear force
    add(this.force, this.force, force);

    if (relativePoint) {
      // Compute produced rotational force
      const rotForce = crossLength(relativePoint, force); // Add rotational force

      this.angularForce += rotForce;
    }
  }
  /**
   * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
   * @param localForce The force vector to add, oriented in local body space.
   * @param localPoint A point relative to the body in local body space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
   * @example
   *     var body = new Body({ mass: 1 });
   *     var localPoint = [1, 0]; // x=1 locally in the body
   *     var localForce = [0, 1]; // up, locally in the body
   *     body.applyForceLocal(localForce, localPoint);
   *     console.log(body.force); // [0, 1]
   *     console.log(body.angularForce); // 1
   */


  applyForceLocal(localForce, localPoint) {
    localPoint = localPoint || applyForce_pointLocal;
    const worldForce = applyForce_forceWorld;
    const worldPoint = applyForce_pointWorld;
    this.vectorToWorldFrame(worldForce, localForce);
    this.vectorToWorldFrame(worldPoint, localPoint);
    this.applyForce(worldForce, worldPoint);
  }
  /**
   * Apply impulse to a point relative to the body. This could for example be a point on the Body surface.
   * An impulse is a force added to a body during a short period of time (impulse = force * time).
   * Impulses will be added to Body.velocity and Body.angularVelocity.
   * @param impulseVector The impulse vector to add, oriented in world space.
   * @param relativePoint A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
   * @example
   *     var body = new Body({ mass: 1 });
   *     var relativePoint = [0, 0]; // center of the body
   *     var impulseVector = [0, 1]; // world up
   *     body.applyImpulse(impulseVector, relativePoint);
   */


  applyImpulse(impulseVector, relativePoint) {
    if (this.type !== Body.DYNAMIC) {
      return;
    } // Compute produced central impulse velocity


    const velo = applyImpulse_velo;
    scale(velo, impulseVector, this.invMass);
    multiply(velo, this.massMultiplier, velo); // Add linear impulse

    add(this.velocity, velo, this.velocity);

    if (relativePoint) {
      // Compute produced rotational impulse velocity
      let rotVelo = crossLength(relativePoint, impulseVector);
      rotVelo *= this.invInertia; // Add rotational Impulse

      this.angularVelocity += rotVelo;
    }
  }
  /**
   * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
   * @param localImpulse The impulse vector to add, oriented in local body space.
   * @param localPoint A point relative to the body in local body space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
   * @example
   *     var body = new Body({ mass: 1 });
   *     var localPoint = [1, 0]; // x=1, locally in the body
   *     var localImpulse = [0, 1]; // up, locally in the body
   *     body.applyImpulseLocal(localImpulse, localPoint);
   *     console.log(body.velocity); // [1, 0]
   *     console.log(body.angularVelocity); // 1
   */


  applyImpulseLocal(localImpulse, localPoint) {
    localPoint = localPoint || applyImpulse_pointLocal;
    const worldImpulse = applyImpulse_impulseWorld;
    const worldPoint = applyImpulse_pointWorld;
    this.vectorToWorldFrame(worldImpulse, localImpulse);
    this.vectorToWorldFrame(worldPoint, localPoint);
    this.applyImpulse(worldImpulse, worldPoint);
  }
  /**
   * Transform a world point to local body frame.
   * @param out The point to store the result in
   * @param worldPoint The input world point
   */


  toLocalFrame(out, worldPoint) {
    toLocalFrame(out, worldPoint, this.position, this.angle);
  }
  /**
   * Transform a local point to world frame.
   * @param out The point to store the result in
   * @param localPoint The input local point
   */


  toWorldFrame(out, localPoint) {
    toGlobalFrame(out, localPoint, this.position, this.angle);
  }
  /**
   * Transform a world vector to local body frame.
   * @param out The vector to store the result in
   * @param worldVector The input world vector
   */


  vectorToLocalFrame(out, worldVector) {
    vectorToLocalFrame(out, worldVector, this.angle);
  }
  /**
   * Transform a local vector to world frame.
   * @param out The vector to store the result in
   * @param localVector The input local vector
   */


  vectorToWorldFrame(out, localVector) {
    vectorToGlobalFrame(out, localVector, this.angle);
  }
  /**
   * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
   * @param path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
   * @param options
   * @param options.optimalDecomp=false   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
   * @param options.skipSimpleCheck=false Set to true if you already know that the path is not intersecting itself.
   * @param options.removeCollinearPoints=false Set to a number (angle threshold value) to remove collinear points, or false to keep all points.
   * @return True on success, else false.
   * @example
   *     var body = new Body();
   *     var path = [
   *         [-1, 1],
   *         [-1, 0],
   *         [1, 0],
   *         [1, 1],
   *         [0.5, 0.5]
   *     ];
   *     body.fromPolygon(path);
   *     console.log(body.shapes); // [Convex, Convex, ...]
   */


  fromPolygon(path, options) {
    if (options === void 0) {
      options = {};
    }

    // Remove all shapes
    for (let i = this.shapes.length; i >= 0; --i) {
      this.removeShape(this.shapes[i]);
    } // Copy the path


    const p = [];

    for (let i = 0; i < path.length; i++) {
      p[i] = clone(path[i]);
    } // Make it counter-clockwise


    makeCCW(p); // Remove collinear points

    if (options.removeCollinearPoints !== undefined) {
      if (typeof options.removeCollinearPoints === 'boolean') {
        if (options.removeCollinearPoints === true) {
          removeCollinearPoints(p);
        }
      } else {
        removeCollinearPoints(p, options.removeCollinearPoints);
      }
    } // Check if any line segment intersects the path itself


    if (!options.skipSimpleCheck) {
      if (!isSimple(p)) {
        return false;
      }
    } // Save this path for later


    const concavePath = this.concavePath = [];

    for (let i = 0; i < p.length; i++) {
      concavePath[i] = clone(p[i]);
    } // Slow or fast decomp?


    let convexes;

    if (options.optimalDecomp) {
      convexes = decomp(p);

      if (convexes === false) {
        throw new Error('Convex decomposition failed!');
      }
    } else {
      convexes = quickDecomp(p);
    }

    const cm = create(); // Add convexes

    for (let i = 0; i !== convexes.length; i++) {
      // Create convex
      let c = new Convex({
        vertices: convexes[i]
      }); // Move all vertices so its center of mass is in the local center of the convex

      for (let j = 0; j !== c.vertices.length; j++) {
        const v = c.vertices[j];
        subtract(v, v, c.centerOfMass);
      }

      copy(cm, c.centerOfMass);
      c = new Convex({
        vertices: c.vertices
      }); // Add the shape

      this.addShape(c, cm);
    }

    this.adjustCenterOfMass();
    this.aabbNeedsUpdate = true;
    return true;
  }
  /**
   * Moves the shape offsets so their center of mass becomes the body center of mass.
   *
   * @example
   *     var body = new Body({ position: [0, 0] });
   *     var shape = new Circle({ radius: 1 });
   *     body.addShape(shape, [1, 0], 0);
   *     body.adjustCenterOfMass();
   *     console.log(body.position); // [1, 0]
   *     console.log(shape.position); // [0, 0]
   */


  adjustCenterOfMass() {
    const offset_times_area = adjustCenterOfMass_tmp2;
    const sum = adjustCenterOfMass_tmp3;
    const cm = adjustCenterOfMass_tmp4;
    let totalArea = 0;
    set(sum, 0, 0);

    for (let i = 0; i !== this.shapes.length; i++) {
      const s = this.shapes[i];
      scale(offset_times_area, s.position, s.area);
      add(sum, sum, offset_times_area);
      totalArea += s.area;
    }

    scale(cm, sum, 1 / totalArea); // Now move all shapes

    for (let i = 0; i !== this.shapes.length; i++) {
      const s = this.shapes[i];
      subtract(s.position, s.position, cm);
    } // Move the body position too


    add(this.position, this.position, cm); // And concave path

    for (let i = 0; this.concavePath && i < this.concavePath.length; i++) {
      subtract(this.concavePath[i], this.concavePath[i], cm);
    }

    this.updateMassProperties();
    this.updateBoundingRadius();
  }
  /**
   * Sets the force on the body to zero.
   */


  setZeroForce() {
    const f = this.force;
    f[0] = f[1] = this.angularForce = 0;
  }
  /**
   * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
   * @param dt Current time step
   */


  applyDamping(dt) {
    if (this.type === Body.DYNAMIC) {
      // Only for dynamic bodies
      const v = this.velocity;
      scale(v, v, Math.pow(1 - this.damping, dt));
      this.angularVelocity *= Math.pow(1 - this.angularDamping, dt);
    }
  }
  /**
   * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
   * Sets the sleepState to {@link Body.AWAKE} and emits the wakeUp event if the body wasn't awake before.
   */


  wakeUp() {
    const s = this.sleepState;
    this.sleepState = Body.AWAKE;
    this.idleTime = 0;

    if (s !== Body.AWAKE) {
      this.emit({
        type: 'wakeup'
      });
    }
  }
  /**
   * Force body sleep
   */


  sleep() {
    this.sleepState = Body.SLEEPING;
    this.angularVelocity = this.angularForce = 0;
    set(this.velocity, 0, 0);
    set(this.force, 0, 0);
    this.emit({
      type: 'sleep'
    });
  }
  /**
   * Called every timestep to update internal sleep timer and change sleep state if needed.
   * @param time The world time in seconds
   * @param dontSleep
   * @param dt
   */


  sleepTick(time, dontSleep, dt) {
    if (!this.allowSleep || this.type === Body.SLEEPING) {
      return;
    }

    this.wantsToSleep = false;
    const speedSquared = squaredLength(this.velocity) + Math.pow(this.angularVelocity, 2),
          speedLimitSquared = Math.pow(this.sleepSpeedLimit, 2); // Add to idle time

    if (speedSquared >= speedLimitSquared) {
      this.idleTime = 0;
      this.sleepState = Body.AWAKE;
    } else {
      this.idleTime += dt;

      if (this.sleepState !== Body.SLEEPY) {
        this.sleepState = Body.SLEEPY;
        this.emit({
          type: 'sleepy'
        });
      }
    }

    if (this.idleTime > this.sleepTimeLimit) {
      if (!dontSleep) {
        this.sleep();
      } else {
        this.wantsToSleep = true;
      }
    }
  }
  /**
   * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
   * @param body
   * @return if the body overlaps the given body
   */


  overlaps(body) {
    if (this.world === null) {
      return false;
    }

    return this.world.overlapKeeper.bodiesAreOverlapping(this, body);
  }
  /**
   * Move the body forward in time given its current velocity.
   * @param dt
   */


  integrate(dt) {
    const minv = this.invMass,
          f = this.force,
          pos = this.position,
          velo = this.velocity; // Save old position

    copy(this.previousPosition, this.position);
    this.previousAngle = this.angle; // Velocity update

    if (!this.fixedRotation) {
      this.angularVelocity += this.angularForce * this.invInertia * dt;
    }

    scale(integrate_fhMinv, f, dt * minv);
    multiply(integrate_fhMinv, this.massMultiplier, integrate_fhMinv);
    add(velo, integrate_fhMinv, velo); // CCD

    if (!this.integrateToTimeOfImpact(dt)) {
      // Regular position update
      scale(integrate_velodt, velo, dt);
      add(pos, pos, integrate_velodt);

      if (!this.fixedRotation) {
        this.angle += this.angularVelocity * dt;
      }
    }

    this.aabbNeedsUpdate = true;
  }
  /**
   * Get velocity of a point in the body.
   * @param result A vector to store the result in
   * @param relativePoint A world oriented vector, indicating the position of the point to get the velocity from
   * @return The result vector
   * 
   * @example
   *     var body = new Body({
       *         mass: 1,
       *         velocity: [1, 0],
       *         angularVelocity: 1
       *     });
       *     var result = [];
       *     var point = [1, 0];
       *     body.getVelocityAtPoint(result, point);
       *     console.log(result); // [1, 1]
       */


  getVelocityAtPoint(result, relativePoint) {
    crossVZ(result, relativePoint, this.angularVelocity);
    subtract(result, this.velocity, result);
    return result;
  }

  integrateToTimeOfImpact(dt) {
    if (this.world === null) {
      throw new Error('world is not set for body');
    }

    if (this.ccdSpeedThreshold < 0 || squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)) {
      return false;
    } // Ignore all the ignored body pairs
    // This should probably be done somewhere else for optimization


    const ignoreBodies = [];
    const disabledPairs = this.world.disabledBodyCollisionPairs;

    for (let i = 0; i < disabledPairs.length; i += 2) {
      const bodyA = disabledPairs[i];
      const bodyB = disabledPairs[i + 1];

      if (bodyA === this) {
        ignoreBodies.push(bodyB);
      } else if (bodyB === this) {
        ignoreBodies.push(bodyA);
      }
    }

    normalize(integrateToTimeOfImpact_direction, this.velocity);
    scale(integrateToTimeOfImpact_end, this.velocity, dt);
    add(integrateToTimeOfImpact_end, integrateToTimeOfImpact_end, this.position);
    subtract(integrateToTimeOfImpact_startToEnd, integrateToTimeOfImpact_end, this.position);
    const startToEndAngle = this.angularVelocity * dt;
    const len = length(integrateToTimeOfImpact_startToEnd);
    let timeOfImpact = 1;
    let hitBody = null;
    copy(integrateToTimeOfImpact_ray.from, this.position);
    copy(integrateToTimeOfImpact_ray.to, integrateToTimeOfImpact_end);
    integrateToTimeOfImpact_ray.update();

    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      integrateToTimeOfImpact_result.reset();
      integrateToTimeOfImpact_ray.collisionGroup = shape.collisionGroup;
      integrateToTimeOfImpact_ray.collisionMask = shape.collisionMask;
      this.world.raycast(integrateToTimeOfImpact_result, integrateToTimeOfImpact_ray);
      hitBody = integrateToTimeOfImpact_result.body;

      if (hitBody !== null && (hitBody === this || ignoreBodies.indexOf(hitBody) !== -1)) {
        hitBody = null;
      }

      if (hitBody) {
        break;
      }
    }

    if (!hitBody || !timeOfImpact) {
      return false;
    }

    integrateToTimeOfImpact_result.getHitPoint(integrateToTimeOfImpact_end, integrateToTimeOfImpact_ray);
    subtract(integrateToTimeOfImpact_startToEnd, integrateToTimeOfImpact_end, this.position);
    timeOfImpact = distance(integrateToTimeOfImpact_end, this.position) / len; // guess

    const rememberAngle = this.angle;
    copy(integrateToTimeOfImpact_rememberPosition, this.position); // Got a start and end point. Approximate time of impact using binary search

    let iter = 0;
    let tmin = 0;
    let tmid = timeOfImpact;
    let tmax = 1;

    while (tmax >= tmin && iter < this.ccdIterations) {
      iter++; // calculate the midpoint

      tmid = (tmax + tmin) / 2; // Move the body to that point

      scale(integrate_velodt, integrateToTimeOfImpact_startToEnd, tmid);
      add(this.position, integrateToTimeOfImpact_rememberPosition, integrate_velodt);
      this.angle = rememberAngle + startToEndAngle * tmid;
      this.updateAABB(); // check overlap

      const overlaps = this.aabb.overlaps(hitBody.aabb) && this.world.narrowphase.bodiesOverlap(this, hitBody, true);

      if (overlaps) {
        // change max to search lower interval
        tmax = tmid;
      } else {
        // change min to search upper interval
        tmin = tmid;
      }
    }

    timeOfImpact = tmax; // Need to guarantee overlap to resolve collisions

    copy(this.position, integrateToTimeOfImpact_rememberPosition);
    this.angle = rememberAngle; // move to TOI

    scale(integrate_velodt, integrateToTimeOfImpact_startToEnd, timeOfImpact);
    add(this.position, this.position, integrate_velodt);

    if (!this.fixedRotation) {
      this.angle += startToEndAngle * timeOfImpact;
    }

    return true;
  }

  resetConstraintVelocity() {
    const vlambda = this.vlambda;
    set(vlambda, 0, 0);
    this.wlambda = 0;
  }

  addConstraintVelocity() {
    const v = this.velocity;
    add(v, v, this.vlambda);
    this.angularVelocity += this.wlambda;
  }

}
Body.DYNAMIC = 1;
Body.STATIC = 2;
Body.KINEMATIC = 4;
Body.AWAKE = 0;
Body.SLEEPY = 1;
Body.SLEEPING = 2;
Body._idCounter = 0;
const updateAABB_shapeAABB = new AABB();
const updateAABB_tmp = create();
const applyForce_forceWorld = create();
const applyForce_pointWorld = create();
const applyForce_pointLocal = create();
const applyImpulse_velo = create();
const applyImpulse_impulseWorld = create();
const applyImpulse_pointWorld = create();
const applyImpulse_pointLocal = create();
const adjustCenterOfMass_tmp2 = create();
const adjustCenterOfMass_tmp3 = create();
const adjustCenterOfMass_tmp4 = create();
const integrate_fhMinv = create();
const integrate_velodt = create();
const integrateToTimeOfImpact_result = new RaycastResult();
const integrateToTimeOfImpact_ray = new Ray({
  mode: Ray.CLOSEST,
  skipBackfaces: true
});
const integrateToTimeOfImpact_direction = create();
const integrateToTimeOfImpact_end = create();
const integrateToTimeOfImpact_startToEnd = create();
const integrateToTimeOfImpact_rememberPosition = create();

/**
 * Base class for broadphase implementations. Don't use this class directly.
 */
class Broadphase {
  /**
   * Axis aligned bounding box type.
   */

  /**
   * Bounding circle type.
   */

  /**
   * Naive Broadphase
   */

  /**
   * SAP Broadphase
   */

  /**
   * Check whether the bounding radius of two bodies overlap.
   * @param bodyA
   * @param bodyB
   * @returns
   */
  static boundingRadiusCheck(bodyA, bodyB) {
    const d2 = squaredDistance(bodyA.position, bodyB.position),
          r = bodyA.boundingRadius + bodyB.boundingRadius;
    return d2 <= r * r;
  }
  /**
   * Check whether the AABB of two bodies overlap.
   * @param bodyA
   * @param bodyB
   * @returns
   */


  static aabbCheck(bodyA, bodyB) {
    return bodyA.getAABB().overlaps(bodyB.getAABB());
  }
  /**
   * Check whether two bodies are allowed to collide at all.
   * @param bodyA
   * @param bodyB
   */


  static canCollide(bodyA, bodyB) {
    const KINEMATIC = Body.KINEMATIC;
    const STATIC = Body.STATIC;
    const typeA = bodyA.type;
    const typeB = bodyB.type; // Cannot collide static bodies

    if (typeA === STATIC && typeB === STATIC) {
      return false;
    } // Cannot collide static vs kinematic bodies


    if (typeA === KINEMATIC && typeB === STATIC || typeA === STATIC && typeB === KINEMATIC) {
      return false;
    } // Cannot collide kinematic vs kinematic


    if (typeA === KINEMATIC && typeB === KINEMATIC) {
      return false;
    } // Cannot collide both sleeping bodies


    if (bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING) {
      return false;
    } // Cannot collide if one is static and the other is sleeping


    if (bodyA.sleepState === Body.SLEEPING && typeB === STATIC || bodyB.sleepState === Body.SLEEPING && typeA === STATIC) {
      return false;
    }

    return true;
  }

  constructor(type) {
    this.type = type;
    this.result = [];
    this.world = undefined;
    this.boundingVolumeType = Broadphase.AABB;
  }
  /**
   * Get all potential intersecting body pairs.
   * @param world The world to search in.
   * @return An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
   */


  /**
   * Set the world that we are searching for collision pairs in.
   * @param world
   */
  setWorld(world) {
    this.world = world;
  }
  /**
   * Check whether the bounding volumes of two bodies overlap.
   * @param bodyA
   * @param bodyB
   */


  boundingVolumeCheck(bodyA, bodyB) {
    switch (this.boundingVolumeType) {
      case Broadphase.BOUNDING_CIRCLE:
        return Broadphase.boundingRadiusCheck(bodyA, bodyB);

      case Broadphase.AABB:
        return Broadphase.aabbCheck(bodyA, bodyB);

      default:
        throw new Error('Bounding volume type not recognized: ' + this.boundingVolumeType);
    }
  }

}
Broadphase.AABB = 1;
Broadphase.BOUNDING_CIRCLE = 2;
Broadphase.NAIVE = 1;
Broadphase.SAP = 2;

/**
 * Naive broadphase implementation. Does N^2 tests.
 */

class NaiveBroadphase extends Broadphase {
  constructor() {
    super(Broadphase.NAIVE);
  }
  /**
   * Get the colliding pairs
   * @param world
   * @return
   */


  getCollisionPairs(world) {
    const bodies = world.bodies;
    const result = this.result;
    result.length = 0;

    for (let i = 0, Ncolliding = bodies.length; i !== Ncolliding; i++) {
      const bi = bodies[i];

      for (let j = 0; j < i; j++) {
        const bj = bodies[j];

        if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
          result.push(bi, bj);
        }
      }
    }

    return result;
  }
  /**
   * Returns all the bodies within an AABB.
   * @param world
   * @param aabb
   * @param result An array to store resulting bodies in.
   */


  aabbQuery(world, aabb, result) {
    if (result === void 0) {
      result = [];
    }

    const bodies = world.bodies;

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];

      if (b.aabbNeedsUpdate) {
        b.updateAABB();
      }

      if (b.aabb.overlaps(aabb)) {
        result.push(b);
      }
    }

    return result;
  }

}

/**
 * (Note that this options object will be passed on to the {@link Shape} constructor.)
 */

/**
 * Box shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var boxShape = new Box({
 *         width: 2,
 *         height: 1
 *     });
 *     body.addShape(boxShape);
 */
class Box extends Convex {
  /**
   * Total width of the box
   */

  /**
   * Total height of the box
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: Shape.BOX,
      width: options.width ?? 1,
      height: options.height ?? 1
    };
    const verts = [fromValues(-params.width / 2, -params.height / 2), fromValues(params.width / 2, -params.height / 2), fromValues(params.width / 2, params.height / 2), fromValues(-params.width / 2, params.height / 2)];
    const convexOptions = options;
    convexOptions.vertices = verts;
    convexOptions.type = Shape.BOX;
    super(convexOptions);
    this.width = params.width;
    this.height = params.height;
    this.updateBoundingRadius();
    this.updateArea();
  }
  /**
   * Compute moment of inertia
   */


  computeMomentOfInertia() {
    const w = this.width;
    const h = this.height;
    return (h * h + w * w) / 12;
  }
  /**
   * Update the bounding radius
   */


  updateBoundingRadius() {
    const w = this.width,
          h = this.height;
    this.boundingRadius = Math.sqrt(w * w + h * h) / 2;
  }
  /**
   * @param out The resulting AABB.
   * @param position
   * @param angle
   */


  computeAABB(out, position, angle) {
    const c = Math.abs(Math.cos(angle));
    const s = Math.abs(Math.sin(angle));
    const w = this.width;
    const h = this.height;
    const height = (w * s + h * c) * 0.5;
    const width = (h * s + w * c) * 0.5;
    const l = out.lowerBound;
    const u = out.upperBound;
    const px = position[0];
    const py = position[1];
    l[0] = px - width;
    l[1] = py - height;
    u[0] = px + width;
    u[1] = py + height;
  }

  updateArea() {
    this.area = this.width * this.height;
  }

  pointTest(localPoint) {
    return Math.abs(localPoint[0]) <= this.width * 0.5 && Math.abs(localPoint[1]) <= this.height * 0.5;
  }

}

/**
 * (Note that this options object will be passed on to the {@link Shape} constructor.)
 */

/**
 * Circle shape class.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var circleShape = new Circle({
 *         radius: 1
 *     });
 *     body.addShape(circleShape);
 */
class Circle extends Shape {
  /**
   * The radius of the circle.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: Shape.CIRCLE,
      radius: options.radius ?? 1
    };
    super(params);
    this.radius = params.radius;
    this.updateBoundingRadius();
    this.updateArea();
  }

  updateBoundingRadius() {
    this.boundingRadius = this.radius;
  }

  computeMomentOfInertia() {
    const r = this.radius;
    return r * r / 2;
  }

  updateArea() {
    this.area = Math.PI * this.radius * this.radius;
  }

  computeAABB(out, position) {
    const r = this.radius;
    set(out.upperBound, r, r);
    set(out.lowerBound, -r, -r);

    if (position) {
      add(out.lowerBound, out.lowerBound, position);
      add(out.upperBound, out.upperBound, position);
    }
  }

  raycast(result, ray, position) {
    const from = ray.from;
    const to = ray.to;
    const r = this.radius;
    const a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
    const b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
    const c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);
    const delta = Math.pow(b, 2) - 4 * a * c;
    const intersectionPoint = Ray_intersectSphere_intersectionPoint;
    const normal = Ray_intersectSphere_normal;

    if (delta < 0) {
      // No intersection
      return;
    } else if (delta === 0) {
      // single intersection point
      lerp(intersectionPoint, from, to, delta);
      subtract(normal, intersectionPoint, position);
      normalize(normal, normal);
      ray.reportIntersection(result, delta, normal, -1);
    } else {
      const sqrtDelta = Math.sqrt(delta);
      const inv2a = 1 / (2 * a);
      const d1 = (-b - sqrtDelta) * inv2a;
      const d2 = (-b + sqrtDelta) * inv2a;

      if (d1 >= 0 && d1 <= 1) {
        lerp(intersectionPoint, from, to, d1);
        subtract(normal, intersectionPoint, position);
        normalize(normal, normal);
        ray.reportIntersection(result, d1, normal, -1);

        if (result.shouldStop(ray)) {
          return;
        }
      }

      if (d2 >= 0 && d2 <= 1) {
        lerp(intersectionPoint, from, to, d2);
        subtract(normal, intersectionPoint, position);
        normalize(normal, normal);
        ray.reportIntersection(result, d2, normal, -1);
      }
    }
  }

  pointTest(localPoint) {
    const radius = this.radius;
    return squaredLength(localPoint) <= radius * radius;
  }

}
const Ray_intersectSphere_intersectionPoint = create();
const Ray_intersectSphere_normal = create();

/**
 * Base class for constraint equations.
 */

class Equation {
  /**
   * The default stiffness when creating a new Equation.
   */

  /**
   * The default relaxation when creating a new Equation.
   */

  /**
   * Constructor for an Equation
   * @param bodyA First body participating in the equation
   * @param bodyB Second body participating in the equation
   * @param minForce Minimum force to apply. Default: -Number.MAX_VALUE
   * @param maxForce Maximum force to apply. Default: Number.MAX_VALUE
   * @param bodyB
   * @param minForce
   * @param maxForce
   */
  constructor(bodyA, bodyB, minForce, maxForce) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.minForce = minForce ?? -Number.MAX_VALUE;
    this.maxForce = maxForce ?? Number.MAX_VALUE;
    this.maxBias = Number.MAX_VALUE;
    this.stiffness = Equation.DEFAULT_STIFFNESS;
    this.relaxation = Equation.DEFAULT_RELAXATION;
    this.G = new ARRAY_TYPE(6);

    for (let i = 0; i < 6; i++) {
      this.G[i] = 0;
    }

    this.offset = 0;
    this.a = 0;
    this.b = 0;
    this.epsilon = 0;
    this.timeStep = 1 / 60;
    this.needsUpdate = true;
    this.multiplier = 0;
    this.relativeVelocity = 0;
    this.enabled = true; // Temp stuff

    this.lambda = this.B = this.invC = this.minForceDt = this.maxForceDt = 0;
    this.index = -1;
  }

  update() {
    const k = this.stiffness,
          d = this.relaxation,
          h = this.timeStep;
    this.a = 4 / (h * (1 + 4 * d));
    this.b = 4 * d / (1 + 4 * d);
    this.epsilon = 4 / (h * h * k * (1 + 4 * d));
    this.needsUpdate = false;
  }
  /**
   * Multiply a jacobian entry with corresponding positions or velocities
   */


  gmult(G, vi, wi, vj, wj) {
    return G[0] * vi[0] + G[1] * vi[1] + G[2] * wi + G[3] * vj[0] + G[4] * vj[1] + G[5] * wj;
  }
  /**
   * Computes the RHS of the SPOOK equation
   */


  computeB(a, b, h) {
    const GW = this.computeGW();
    let Gq = this.computeGq();
    const maxBias = this.maxBias;

    if (Math.abs(Gq) > maxBias) {
      Gq = Gq > 0 ? maxBias : -maxBias;
    }

    const GiMf = this.computeGiMf();
    const B = -Gq * a - GW * b - GiMf * h;
    return B;
  }
  /**
   * Computes G\*q, where q are the generalized body coordinates
   */


  computeGq() {
    const G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          ai = bi.angle,
          aj = bj.angle;
    return this.gmult(G, qi, ai, qj, aj) + this.offset;
  }
  /**
   * Computes G\*W, where W are the body velocities
   */


  computeGW() {
    const G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          vi = bi.velocity,
          vj = bj.velocity,
          wi = bi.angularVelocity,
          wj = bj.angularVelocity;
    return this.gmult(G, vi, wi, vj, wj) + this.relativeVelocity;
  }
  /**
   * Computes G\*Wlambda, where W are the body velocities
   */


  computeGWlambda() {
    const G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          vi = bi.vlambda,
          vj = bj.vlambda,
          wi = bi.wlambda,
          wj = bj.wlambda;
    return this.gmult(G, vi, wi, vj, wj);
  }
  /**
   * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
   */


  computeGiMf() {
    const bi = this.bodyA,
          bj = this.bodyB,
          fi = bi.force,
          ti = bi.angularForce,
          fj = bj.force,
          tj = bj.angularForce,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          G = this.G;
    scale(iMfi, fi, invMassi);
    multiply(iMfi, bi.massMultiplier, iMfi);
    scale(iMfj, fj, invMassj);
    multiply(iMfj, bj.massMultiplier, iMfj);
    return this.gmult(G, iMfi, ti * invIi, iMfj, tj * invIj);
  }
  /**
   * Computes G\*inv(M)\*G'
   */


  computeGiMGt() {
    const bi = this.bodyA,
          bj = this.bodyB,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          G = this.G;
    return G[0] * G[0] * invMassi * bi.massMultiplier[0] + G[1] * G[1] * invMassi * bi.massMultiplier[1] + G[2] * G[2] * invIi + G[3] * G[3] * invMassj * bj.massMultiplier[0] + G[4] * G[4] * invMassj * bj.massMultiplier[1] + G[5] * G[5] * invIj;
  }
  /**
   * Add constraint velocity to the bodies.
   * @param deltalambda
   */


  addToWlambda(deltalambda) {
    const bi = this.bodyA,
          bj = this.bodyB,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          G = this.G;
    addToVLambda(bi.vlambda, G[0], G[1], invMassi, deltalambda, bi.massMultiplier);
    bi.wlambda += invIi * G[2] * deltalambda;
    addToVLambda(bj.vlambda, G[3], G[4], invMassj, deltalambda, bj.massMultiplier);
    bj.wlambda += invIj * G[5] * deltalambda;
  }
  /**
   * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
   * @param eps
   */


  computeInvC(eps) {
    const invC = 1 / (this.computeGiMGt() + eps);
    return invC;
  }

}
Equation.DEFAULT_STIFFNESS = 1e6;
Equation.DEFAULT_RELAXATION = 4;
const qi = create();
const qj = create();
const iMfi = create();
const iMfj = create();

function addToVLambda(vlambda, Gx, Gy, invMass, deltalambda, massMultiplier) {
  vlambda[0] += Gx * invMass * deltalambda * massMultiplier[0];
  vlambda[1] += Gy * invMass * deltalambda * massMultiplier[1];
}

function addSubSub(out, a, b, c, d) {
  out[0] = a[0] + b[0] - c[0] - d[0];
  out[1] = a[1] + b[1] - c[1] - d[1];
}

const vi = create();
const vj = create();
const relVel = create();
const tmpShape$1 = new Circle({
  radius: 1
});
/**
 * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
 */

class ContactEquation extends Equation {
  /**
   * Vector from body i center of mass to the contact point.
   */

  /**
   * World-oriented vector from body A center of mass to the contact point.
   */

  /**
   * The normal vector, pointing out of body i
   */

  /**
   * The restitution to use (0=no bounciness, 1=max bounciness).
   */

  /**
   * This property is set to true if this is the first impact between the bodies (not persistant contact).
   */

  /**
   * The shape in body i that triggered this contact.
   */
  constructor(bodyA, bodyB) {
    super(bodyA, bodyB, 0, Number.MAX_VALUE);
    this.contactPointA = create();
    this.penetrationVec = create();
    this.contactPointB = create();
    this.normalA = create();
    this.restitution = 0;
    this.firstImpact = false;
    this.shapeA = tmpShape$1;
    this.shapeB = tmpShape$1;
  }

  computeB(a, b, h) {
    const bi = this.bodyA,
          bj = this.bodyB,
          ri = this.contactPointA,
          rj = this.contactPointB,
          xi = bi.position,
          xj = bj.position;
    const n = this.normalA;
    const G = this.G; // Caluclate cross products

    const rixn = crossLength(ri, n);
    const rjxn = crossLength(rj, n); // G = [-n -rixn n rjxn]

    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn; // Compute iteration

    let GW, Gq;

    if (this.firstImpact && this.restitution !== 0) {
      Gq = 0;
      GW = 1 / b * (1 + this.restitution) * this.computeGW();
    } else {
      // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
      const penetrationVec = this.penetrationVec;
      addSubSub(penetrationVec, xj, rj, xi, ri);
      Gq = dot(n, penetrationVec) + this.offset;
      GW = this.computeGW();
    }

    const GiMf = this.computeGiMf();
    const B = -Gq * a - GW * b - h * GiMf;
    return B;
  }
  /**
   * Get the relative velocity along the normal vector.
   */


  getVelocityAlongNormal() {
    this.bodyA.getVelocityAtPoint(vi, this.contactPointA);
    this.bodyB.getVelocityAtPoint(vj, this.contactPointB);
    subtract(relVel, vi, vj);
    return dot(this.normalA, relVel);
  }

}

/**
 * Object pooling utility.
 */
class Pool {
  constructor(options) {
    this.objects = [];

    if ((options == null ? void 0 : options.size) !== undefined) {
      this.resize(options.size);
    }
  }
  /**
   * Creates a new object in the pool
   */


  /**
   * Resizes the pool
   * @param size
   * @return Self, for chaining
   */
  resize(size) {
    const objects = this.objects;

    while (objects.length > size) {
      objects.pop();
    }

    while (objects.length < size) {
      objects.push(this.create());
    }

    return this;
  }
  /**
   * Get an object from the pool or create a new instance.
   * @return an object from the pool
   */


  get() {
    const objects = this.objects;
    return objects.length ? objects.pop() : this.create();
  }
  /**
   * Release an object back to the pool.
   * @param object
   * @return Self for chaining
   */


  release(object) {
    this.destroy(object);
    this.objects.push(object);
    return this;
  }

}

class ContactEquationPool extends Pool {
  create() {
    return new ContactEquation(tmpBody$2, tmpBody$2);
  }

  destroy(equation) {
    equation.bodyA = equation.bodyB = tmpBody$2;
    return this;
  }

}
const tmpBody$2 = new Body();

/**
 * Constrains the slipping in a contact along a tangent
 */

class FrictionEquation extends Equation {
  /**
   * Relative vector from center of body A to the contact point, world oriented.
   */

  /**
   * Relative vector from center of body B to the contact point, world oriented.
   */

  /**
   * Tangent vector that the friction force will act along. World oriented.
   */

  /**
   * ContactEquations connected to this friction equation. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
   */

  /**
   * The shape in body i that triggered this friction.
   * @todo Needed? The shape can be looked up via contactEquation.shapeA...
   */

  /**
   * The shape in body j that triggered this friction.
   * @todo Needed? The shape can be looked up via contactEquation.shapeB...
   */

  /**
   * The friction coefficient to use.
   */
  constructor(bodyA, bodyB, slipForce) {
    if (slipForce === void 0) {
      slipForce = Number.MAX_VALUE;
    }

    super(bodyA, bodyB, -slipForce, slipForce);
    this.contactPointA = create();
    this.contactPointB = create();
    this.t = create();
    this.contactEquations = [];
    this.shapeA = null;
    this.shapeB = null;
    this.frictionCoefficient = 0.3;
  }
  /**
   * Set the slipping condition for the constraint. The friction force cannot be larger than this value.
   * @param slipForce
   */


  setSlipForce(slipForce) {
    this.maxForce = slipForce;
    this.minForce = -slipForce;
  }
  /**
   * Get the max force for the constraint.
   */


  getSlipForce() {
    return this.maxForce;
  }

  computeB(a, b, h) {
    const ri = this.contactPointA,
          rj = this.contactPointB,
          t = this.t,
          G = this.G; // G = [-t -rixt t rjxt]
    // And remember, this is a pure velocity constraint, g is always zero!

    G[0] = -t[0];
    G[1] = -t[1];
    G[2] = -crossLength(ri, t);
    G[3] = t[0];
    G[4] = t[1];
    G[5] = crossLength(rj, t);
    const GW = this.computeGW();
    const GiMf = this.computeGiMf();
    const B =
    /* - g * a  */
    -GW * b - h * GiMf;
    return B;
  }

}

class FrictionEquationPool extends Pool {
  create() {
    return new FrictionEquation(tmpBody$1, tmpBody$1);
  }

  destroy(equation) {
    equation.bodyA = equation.bodyB = tmpBody$1;
    return this;
  }

}
const tmpBody$1 = new Body();

class TupleDictionary {
  constructor() {
    this.data = {};
    this.keys = [];
  }

  /**
   * Generate a key given two integers
   * @param i
   * @param j
   * @return
   */
  getKey(id1, id2) {
    id1 = id1 | 0;
    id2 = id2 | 0;

    if ((id1 | 0) === (id2 | 0)) {
      return -1;
    } // valid for values < 2^16


    return ((id1 | 0) > (id2 | 0) ? id1 << 16 | id2 & 0xffff : id2 << 16 | id1 & 0xffff) | 0;
  }
  /**
   * Gets data by a given key
   * @param key
   * @return
   */


  getByKey(key) {
    key = key | 0;
    return this.data[key];
  }
  /**
   * Gets a value
   * @param i
   * @param j
   * @return
   */


  get(i, j) {
    return this.data[this.getKey(i, j)];
  }
  /**
   * Set a value.
   * @param i
   * @param j
   * @param value
   */


  set(i, j, value) {
    if (!value) {
      throw new Error('No data!');
    }

    const key = this.getKey(i, j); // Check if key already exists

    if (!this.data[key]) {
      this.keys.push(key);
    }

    this.data[key] = value;
    return key;
  }
  /**
   * Remove all data.
   */


  reset() {
    this.keys = [];
    this.data = {};
  }
  /**
   * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
   * @param dict The TupleDictionary to copy into this one.
   */


  copy(dict) {
    this.keys = dict.keys;
    this.data = dict.data;
  }

}

/**
 * Narrowphase. Creates contacts and friction given shapes and transforms.
 */

class Narrowphase {
  /**
   * Contact equations
   */

  /**
   * Friction equations
   */

  /**
   * Whether to make friction equations in the upcoming contacts.
   */

  /**
   * Whether to make equations enabled in upcoming contacts.
   */

  /**
   * The friction slip force to use when creating friction equations.
   */

  /**
   * Keeps track of the allocated ContactEquations.
   *
   * @example
   *     // Allocate a few equations before starting the simulation.
   *     // This way, no contact objects need to be created on the fly in the game loop.
   *     world.narrowphase.contactEquationPool.resize(1024);
   *     world.narrowphase.frictionEquationPool.resize(1024);
   */

  /**
   * Keeps track of the allocated ContactEquations.
   */

  /**
   * Enable reduction of friction equations.
   * If disabled, a box on a plane will generate 2 contact equations and 2 friction equations.
   * If enabled, there will be only one friction equation. Same kind of simplifications are made for all collision types.
   * @deprecated This flag will be removed when the feature is stable enough.
   * @default true
   */

  /**
   * Keeps track of the colliding bodies last step.
   */

  /**
   * The current contact material
   */
  constructor() {
    var _this = this;

    this.convexLine = function (_convexBody, _convexShape, _convexOffset, _convexAngle, _lineBody, _lineShape, _lineOffset, _lineAngle, _justTest) {

      return 0;
    };

    this.lineBox = function (_lineBody, _lineShape, _lineOffset, _lineAngle, _boxBody, _boxShape, _boxOffset, _boxAngle, _justTest) {

      return 0;
    };

    this.convexCapsule = function (convexBody, convexShape, convexPosition, convexAngle, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      // Check the circles
      // Add offsets!
      const circlePos = convexCapsule_tempVec;
      const halfLength = capsuleShape.length / 2;
      set(circlePos, halfLength, 0);
      toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle);

      const result1 = _this.circleConvex(capsuleBody, capsuleShape, circlePos, capsuleAngle, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);

      set(circlePos, -halfLength, 0);
      toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle);

      const result2 = _this.circleConvex(capsuleBody, capsuleShape, circlePos, capsuleAngle, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);

      if (justTest && result1 + result2 !== 0) {
        return 1;
      } // Check center rect


      const r = convexCapsule_tempRect;
      setConvexToCapsuleShapeMiddle(r, capsuleShape);

      const result = _this.convexConvex(convexBody, convexShape, convexPosition, convexAngle, capsuleBody, r, capsulePosition, capsuleAngle, justTest);

      return result + result1 + result2;
    };

    this.lineCapsule = function (_lineBody, _lineShape, _linePosition, _lineAngle, _capsuleBody, _capsuleShape, _capsulePosition, _capsuleAngle, _justTest) {

      return 0;
    };

    this.capsuleCapsule = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      let enableFrictionBefore = true; // Check the circles
      // Add offsets!

      const circlePosi = capsuleCapsule_tempVec1;
      const circlePosj = capsuleCapsule_tempVec2;
      let numContacts = 0; // Need 4 circle checks, between all

      for (let i = 0; i < 2; i++) {
        set(circlePosi, (i === 0 ? -1 : 1) * si.length / 2, 0);
        toGlobalFrame(circlePosi, circlePosi, xi, ai);

        for (let j = 0; j < 2; j++) {
          set(circlePosj, (j === 0 ? -1 : 1) * sj.length / 2, 0);
          toGlobalFrame(circlePosj, circlePosj, xj, aj); // Temporarily turn off friction

          if (_this.enableFrictionReduction) {
            enableFrictionBefore = _this.enableFriction;
            _this.enableFriction = false;
          }

          const result = _this.circleCircle(bi, si, circlePosi, ai, bj, sj, circlePosj, aj, justTest, si.radius, sj.radius);

          if (_this.enableFrictionReduction) {
            _this.enableFriction = enableFrictionBefore;
          }

          if (justTest && result !== 0) {
            return 1;
          }

          numContacts += result;
        }
      }

      if (_this.enableFrictionReduction) {
        // Temporarily turn off friction
        enableFrictionBefore = _this.enableFriction;
        _this.enableFriction = false;
      } // Check circles against the center boxs


      const rect = capsuleCapsule_tempRect1;
      setConvexToCapsuleShapeMiddle(rect, si);

      const result1 = _this.convexCapsule(bi, rect, xi, ai, bj, sj, xj, aj, justTest);

      if (_this.enableFrictionReduction) {
        _this.enableFriction = enableFrictionBefore;
      }

      if (justTest && result1 !== 0) {
        return 1;
      }

      numContacts += result1;

      if (_this.enableFrictionReduction) {
        // Temporarily turn off friction
        enableFrictionBefore = _this.enableFriction;
        _this.enableFriction = false;
      }

      setConvexToCapsuleShapeMiddle(rect, sj);

      const result2 = _this.convexCapsule(bj, rect, xj, aj, bi, si, xi, ai, justTest);

      if (_this.enableFrictionReduction) {
        _this.enableFriction = enableFrictionBefore;
      }

      if (justTest && result2 !== 0) {
        return 1;
      }

      numContacts += result2;

      if (_this.enableFrictionReduction) {
        if (numContacts && _this.enableFriction) {
          _this.frictionEquations.push(_this.createFrictionFromAverage(numContacts));
        }
      }

      return numContacts;
    };

    this.lineLine = function (_bodyA, _shapeA, _positionA, _angleA, _bodyB, _shapeB, _positionB, _angleB, _justTest) {

      return 0;
    };

    this.planeLine = function (planeBody, planeShape, planeOffset, planeAngle, lineBody, lineShape, lineOffset, lineAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const worldVertex0 = tmp1;
      const worldVertex1 = tmp2;
      const worldVertex01 = tmp3;
      const worldVertex11 = tmp4;
      const worldEdge = tmp5;
      const worldEdgeUnit = tmp6;
      const dist = tmp7;
      const worldNormal = tmp8;
      const worldTangent = tmp9;
      const verts = tmpArray;
      let numContacts = 0; // Get start and end points

      set(worldVertex0, -lineShape.length / 2, 0);
      set(worldVertex1, lineShape.length / 2, 0); // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.

      toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle);
      toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle);
      copy(worldVertex0, worldVertex01);
      copy(worldVertex1, worldVertex11); // Get vector along the line

      subtract(worldEdge, worldVertex1, worldVertex0);
      normalize(worldEdgeUnit, worldEdge); // Get tangent to the edge.

      rotate90cw(worldTangent, worldEdgeUnit);
      rotate(worldNormal, yAxis$3, planeAngle); // Check line ends

      verts[0] = worldVertex0;
      verts[1] = worldVertex1;

      for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        subtract(dist, v, planeOffset);
        const d = dot(dist, worldNormal);

        if (d < 0) {
          if (justTest) {
            return 1;
          }

          const c = _this.createContactEquation(planeBody, lineBody, planeShape, lineShape);

          numContacts++;
          copy(c.normalA, worldNormal);
          normalize(c.normalA, c.normalA); // distance vector along plane normal

          scale(dist, worldNormal, d); // Vector from plane center to contact

          subtract(c.contactPointA, v, dist);
          subtract(c.contactPointA, c.contactPointA, planeBody.position); // From line center to contact

          subtract(c.contactPointB, v, lineOffset);
          add(c.contactPointB, c.contactPointB, lineOffset);
          subtract(c.contactPointB, c.contactPointB, lineBody.position);

          _this.contactEquations.push(c);

          if (!_this.enableFrictionReduction) {
            if (_this.enableFriction) {
              _this.frictionEquations.push(_this.createFrictionFromContact(c));
            }
          }
        }
      }

      if (justTest) {
        return 0;
      }

      if (!_this.enableFrictionReduction) {
        if (numContacts && _this.enableFriction) {
          _this.frictionEquations.push(_this.createFrictionFromAverage(numContacts));
        }
      }

      return numContacts;
    };

    this.particleCapsule = function (particleBody, particleShape, particlePosition, particleAngle, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      return _this.circleLine(particleBody, particleShape, particlePosition, particleAngle, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest, capsuleShape.radius, 0);
    };

    this.circleLine = function (circleBody, circleShape, circleOffset, _circleAngle, lineBody, lineShape, lineOffset, lineAngle, justTest, lineRadius, circleRadius) {
      if (justTest === void 0) {
        justTest = false;
      }

      if (lineRadius === void 0) {
        lineRadius = 0;
      }

      if (circleRadius === void 0) {
        circleRadius = circleShape.radius;
      }

      const orthoDist = tmp1;
      const lineToCircleOrthoUnit = tmp2;
      const projectedPoint = tmp3;
      const centerDist = tmp4;
      const worldTangent = tmp5;
      const worldEdge = tmp6;
      const worldEdgeUnit = tmp7;
      const worldVertex0 = tmp8;
      const worldVertex1 = tmp9;
      const worldVertex01 = tmp10;
      const worldVertex11 = tmp11;
      const dist = tmp12;
      const lineToCircle = tmp13;
      const lineEndToLineRadius = tmp14;
      const verts = tmpArray;
      const halfLineLength = lineShape.length / 2; // Get start and end points

      set(worldVertex0, -halfLineLength, 0);
      set(worldVertex1, halfLineLength, 0); // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.

      toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle);
      toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle);
      copy(worldVertex0, worldVertex01);
      copy(worldVertex1, worldVertex11); // Get vector along the line

      subtract(worldEdge, worldVertex1, worldVertex0);
      normalize(worldEdgeUnit, worldEdge); // Get tangent to the edge.

      rotate90cw(worldTangent, worldEdgeUnit); // Check distance from the plane spanned by the edge vs the circle

      subtract(dist, circleOffset, worldVertex0);
      const d = dot(dist, worldTangent); // Distance from center of line to circle center

      subtract(centerDist, worldVertex0, lineOffset);
      subtract(lineToCircle, circleOffset, lineOffset);
      const radiusSum = circleRadius + lineRadius;

      if (Math.abs(d) < radiusSum) {
        // Now project the circle onto the edge
        scale(orthoDist, worldTangent, d);
        subtract(projectedPoint, circleOffset, orthoDist); // Add the missing line radius

        scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
        normalize(lineToCircleOrthoUnit, lineToCircleOrthoUnit);
        scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
        add(projectedPoint, projectedPoint, lineToCircleOrthoUnit); // Check if the point is within the edge span

        const pos = dot(worldEdgeUnit, projectedPoint);
        const pos0 = dot(worldEdgeUnit, worldVertex0);
        const pos1 = dot(worldEdgeUnit, worldVertex1);

        if (pos > pos0 && pos < pos1) {
          // We got contact!
          if (justTest) {
            return 1;
          }

          const c = _this.createContactEquation(circleBody, lineBody, circleShape, lineShape);

          scale(c.normalA, orthoDist, -1);
          normalize(c.normalA, c.normalA);
          scale(c.contactPointA, c.normalA, circleRadius);
          add(c.contactPointA, c.contactPointA, circleOffset);
          subtract(c.contactPointA, c.contactPointA, circleBody.position);
          subtract(c.contactPointB, projectedPoint, lineOffset);
          add(c.contactPointB, c.contactPointB, lineOffset);
          subtract(c.contactPointB, c.contactPointB, lineBody.position);

          _this.contactEquations.push(c);

          if (_this.enableFriction) {
            _this.frictionEquations.push(_this.createFrictionFromContact(c));
          }

          return 1;
        }
      } // Add corner


      verts[0] = worldVertex0;
      verts[1] = worldVertex1;

      for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        subtract(dist, v, circleOffset);

        if (squaredLength(dist) < Math.pow(radiusSum, 2)) {
          if (justTest) {
            return 1;
          }

          const c = _this.createContactEquation(circleBody, lineBody, circleShape, lineShape);

          copy(c.normalA, dist);
          normalize(c.normalA, c.normalA); // Vector from circle to contact point is the normal times the circle radius

          scale(c.contactPointA, c.normalA, circleRadius);
          add(c.contactPointA, c.contactPointA, circleOffset);
          subtract(c.contactPointA, c.contactPointA, circleBody.position);
          subtract(c.contactPointB, v, lineOffset);
          scale(lineEndToLineRadius, c.normalA, -lineRadius);
          add(c.contactPointB, c.contactPointB, lineEndToLineRadius);
          add(c.contactPointB, c.contactPointB, lineOffset);
          subtract(c.contactPointB, c.contactPointB, lineBody.position);

          _this.contactEquations.push(c);

          if (_this.enableFriction) {
            _this.frictionEquations.push(_this.createFrictionFromContact(c));
          }

          return 1;
        }
      }

      return 0;
    };

    this.circleCapsule = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      return _this.circleLine(bi, si, xi, ai, bj, sj, xj, aj, justTest, sj.radius);
    };

    this.circleConvex = function (circleBody, circleShape, circleOffset, _circleAngle, convexBody, convexShape, convexOffset, convexAngle, justTest, circleRadius) {
      if (justTest === void 0) {
        justTest = false;
      }

      if (circleRadius === void 0) {
        circleRadius = circleShape.radius;
      }

      const worldVertex0 = tmp1;
      const worldVertex1 = tmp2;
      const edge = tmp3;
      const edgeUnit = tmp4;
      const normal = tmp5;
      const zero = tmp6;
      const localCirclePosition = tmp7;
      const r = tmp8;
      const dist = tmp10;
      const worldVertex = tmp11;
      const closestEdgeProjectedPoint = tmp13;
      const candidate = tmp14;
      const candidateDist = tmp15;
      let found = -1;
      let minCandidateDistance = Number.MAX_VALUE;
      set(zero, 0, 0); // New algorithm:
      // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
      // 2. For each edge
      // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
      // 2. 2. Check if point is inside.

      toLocalFrame(localCirclePosition, circleOffset, convexOffset, convexAngle);
      const vertices = convexShape.vertices;
      const normals = convexShape.normals;
      const numVertices = vertices.length;
      let normalIndex = -1; // Find the min separating edge.

      let separation = -Number.MAX_VALUE;
      const radius = convexShape.boundingRadius + circleRadius;

      for (let i = 0; i < numVertices; i++) {
        subtract(r, localCirclePosition, vertices[i]);
        const s = dot(normals[i], r);

        if (s > radius) {
          // Early out.
          return 0;
        }

        if (s > separation) {
          separation = s;
          normalIndex = i;
        }
      } // Check edges first


      for (let i = normalIndex + numVertices - 1; i < normalIndex + numVertices + 2; i++) {
        const v0 = vertices[i % numVertices];
        const n = normals[i % numVertices]; // Get point on circle, closest to the convex

        scale(candidate, n, -circleRadius);
        add(candidate, candidate, localCirclePosition);

        if (pointInConvexLocal(candidate, convexShape)) {
          subtract(candidateDist, v0, candidate);
          const candidateDistance = Math.abs(dot(candidateDist, n));

          if (candidateDistance < minCandidateDistance) {
            minCandidateDistance = candidateDistance;
            found = i;
          }
        }
      }

      if (found !== -1) {
        if (justTest) {
          return 1;
        }

        const v0 = vertices[found % numVertices];
        const v1 = vertices[(found + 1) % numVertices];
        toGlobalFrame(worldVertex0, v0, convexOffset, convexAngle);
        toGlobalFrame(worldVertex1, v1, convexOffset, convexAngle);
        subtract(edge, worldVertex1, worldVertex0);
        normalize(edgeUnit, edge); // Get tangent to the edge. Points out of the Convex

        rotate90cw(normal, edgeUnit); // Get point on circle, closest to the convex

        scale(candidate, normal, -circleRadius);
        add(candidate, candidate, circleOffset);
        scale(closestEdgeProjectedPoint, normal, minCandidateDistance);
        add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, candidate);

        const c = _this.createContactEquation(circleBody, convexBody, circleShape, convexShape);

        subtract(c.normalA, candidate, circleOffset);
        normalize(c.normalA, c.normalA);
        scale(c.contactPointA, c.normalA, circleRadius);
        add(c.contactPointA, c.contactPointA, circleOffset);
        subtract(c.contactPointA, c.contactPointA, circleBody.position);
        subtract(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        subtract(c.contactPointB, c.contactPointB, convexBody.position);

        _this.contactEquations.push(c);

        if (_this.enableFriction) {
          _this.frictionEquations.push(_this.createFrictionFromContact(c));
        }

        return 1;
      } // Check closest vertices


      if (circleRadius > 0 && normalIndex !== -1) {
        for (let i = normalIndex + numVertices; i < normalIndex + numVertices + 2; i++) {
          const localVertex = vertices[i % numVertices];
          subtract(dist, localVertex, localCirclePosition);

          if (squaredLength(dist) < circleRadius * circleRadius) {
            if (justTest) {
              return 1;
            }

            toGlobalFrame(worldVertex, localVertex, convexOffset, convexAngle);
            subtract(dist, worldVertex, circleOffset);

            const c = _this.createContactEquation(circleBody, convexBody, circleShape, convexShape);

            copy(c.normalA, dist);
            normalize(c.normalA, c.normalA); // Vector from circle to contact point is the normal times the circle radius

            scale(c.contactPointA, c.normalA, circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            subtract(c.contactPointA, c.contactPointA, circleBody.position);
            subtract(c.contactPointB, worldVertex, convexOffset);
            add(c.contactPointB, c.contactPointB, convexOffset);
            subtract(c.contactPointB, c.contactPointB, convexBody.position);

            _this.contactEquations.push(c);

            if (_this.enableFriction) {
              _this.frictionEquations.push(_this.createFrictionFromContact(c));
            }

            return 1;
          }
        }
      }

      return 0;
    };

    this.particleConvex = function (particleBody, particleShape, particleOffset, _particleAngle, convexBody, convexShape, convexOffset, convexAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const worldVertex0 = tmp1;
      const worldVertex1 = tmp2;
      const worldEdge = tmp3;
      const worldEdgeUnit = tmp4;
      const worldTangent = tmp5;
      const centerDist = tmp6;
      const convexToparticle = tmp7;
      const closestEdgeProjectedPoint = tmp13;
      const candidateDist = tmp14;
      const minEdgeNormal = tmp15;
      const verts = convexShape.vertices;
      let minCandidateDistance = Number.MAX_VALUE;
      let found = false; // Check if the particle is in the polygon at all

      if (!pointInConvex(particleOffset, convexShape, convexOffset, convexAngle)) {
        return 0;
      }

      if (justTest) {
        return 1;
      } // Check edges first


      for (let i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
        const v0 = verts[i % numVerts],
              v1 = verts[(i + 1) % numVerts]; // Transform vertices to world
        // @todo transform point to local space instead

        rotate(worldVertex0, v0, convexAngle);
        rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset); // Get world edge

        subtract(worldEdge, worldVertex1, worldVertex0);
        normalize(worldEdgeUnit, worldEdge); // Get tangent to the edge. Points out of the Convex

        rotate90cw(worldTangent, worldEdgeUnit); // Check distance from the infinite line (spanned by the edge) to the particle

        subtract(centerDist, worldVertex0, convexOffset);
        subtract(convexToparticle, particleOffset, convexOffset);
        subtract(candidateDist, worldVertex0, particleOffset);
        const candidateDistance = Math.abs(dot(candidateDist, worldTangent));

        if (candidateDistance < minCandidateDistance) {
          minCandidateDistance = candidateDistance;
          scale(closestEdgeProjectedPoint, worldTangent, candidateDistance);
          add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, particleOffset);
          copy(minEdgeNormal, worldTangent);
          found = true;
        }
      }

      if (found) {
        const c = _this.createContactEquation(particleBody, convexBody, particleShape, convexShape);

        scale(c.normalA, minEdgeNormal, -1);
        normalize(c.normalA, c.normalA); // Particle has no extent to the contact point

        set(c.contactPointA, 0, 0);
        add(c.contactPointA, c.contactPointA, particleOffset);
        subtract(c.contactPointA, c.contactPointA, particleBody.position); // From convex center to point

        subtract(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        subtract(c.contactPointB, c.contactPointB, convexBody.position);

        _this.contactEquations.push(c);

        if (_this.enableFriction) {
          _this.frictionEquations.push(_this.createFrictionFromContact(c));
        }

        return 1;
      }

      return 0;
    };

    this.circleCircle = function (bodyA, shapeA, offsetA, _angleA, bodyB, shapeB, offsetB, _angleB, justTest, radiusA, radiusB) {
      if (justTest === void 0) {
        justTest = false;
      }

      if (radiusA === void 0) {
        radiusA = shapeA.radius;
      }

      if (radiusB === void 0) {
        radiusB = shapeB.radius;
      }

      const dist = tmp1;
      subtract(dist, offsetA, offsetB);
      const r = radiusA + radiusB;

      if (squaredLength(dist) > r * r) {
        return 0;
      }

      if (justTest) {
        return 1;
      }

      const c = _this.createContactEquation(bodyA, bodyB, shapeA, shapeB);

      const cpA = c.contactPointA;
      const cpB = c.contactPointB;
      const normalA = c.normalA;
      subtract(normalA, offsetB, offsetA);
      normalize(normalA, normalA);
      scale(cpA, normalA, radiusA);
      scale(cpB, normalA, -radiusB);
      addsubtract(cpA, cpA, offsetA, bodyA.position);
      addsubtract(cpB, cpB, offsetB, bodyB.position);

      _this.contactEquations.push(c);

      if (_this.enableFriction) {
        _this.frictionEquations.push(_this.createFrictionFromContact(c));
      }

      return 1;
    };

    this.planeConvex = function (planeBody, planeShape, planeOffset, planeAngle, convexBody, convexShape, convexOffset, convexAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const worldVertex = tmp1;
      const worldNormal = tmp2;
      const dist = tmp3;
      const localPlaneOffset = tmp4;
      const localPlaneNormal = tmp5;
      const localDist = tmp6;
      let numReported = 0;
      rotate(worldNormal, yAxis$3, planeAngle); // Get convex-local plane offset and normal

      vectorToLocalFrame(localPlaneNormal, worldNormal, convexAngle);
      toLocalFrame(localPlaneOffset, planeOffset, convexOffset, convexAngle);
      const vertices = convexShape.vertices;

      for (let i = 0, numVerts = vertices.length; i !== numVerts; i++) {
        const v = vertices[i];
        subtract(localDist, v, localPlaneOffset);

        if (dot(localDist, localPlaneNormal) <= 0) {
          if (justTest) {
            return 1;
          }

          toGlobalFrame(worldVertex, v, convexOffset, convexAngle);
          subtract(dist, worldVertex, planeOffset); // Found vertex

          numReported++;

          const c = _this.createContactEquation(planeBody, convexBody, planeShape, convexShape);

          subtract(dist, worldVertex, planeOffset);
          copy(c.normalA, worldNormal);
          const d = dot(dist, c.normalA);
          scale(dist, c.normalA, d); // rj is from convex center to contact

          subtract(c.contactPointB, worldVertex, convexBody.position); // ri is from plane center to contact

          subtract(c.contactPointA, worldVertex, dist);
          subtract(c.contactPointA, c.contactPointA, planeBody.position);

          _this.contactEquations.push(c);

          if (!_this.enableFrictionReduction) {
            if (_this.enableFriction) {
              _this.frictionEquations.push(_this.createFrictionFromContact(c));
            }
          }
        }
      }

      if (_this.enableFrictionReduction) {
        if (_this.enableFriction && numReported) {
          _this.frictionEquations.push(_this.createFrictionFromAverage(numReported));
        }
      }

      return numReported;
    };

    this.particlePlane = function (particleBody, particleShape, particleOffset, _particleAngle, planeBody, planeShape, planeOffset, planeAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const dist = tmp1;
      const worldNormal = tmp2;
      planeAngle = planeAngle || 0;
      subtract(dist, particleOffset, planeOffset);
      rotate(worldNormal, yAxis$3, planeAngle);
      const d = dot(dist, worldNormal);

      if (d > 0) {
        return 0;
      }

      if (justTest) {
        return 1;
      }

      const c = _this.createContactEquation(planeBody, particleBody, planeShape, particleShape);

      copy(c.normalA, worldNormal);
      scale(dist, c.normalA, d); // dist is now the distance vector in the normal direction
      // ri is the particle position projected down onto the plane, from the plane center

      subtract(c.contactPointA, particleOffset, dist);
      subtract(c.contactPointA, c.contactPointA, planeBody.position); // rj is from the body center to the particle center

      subtract(c.contactPointB, particleOffset, particleBody.position);

      _this.contactEquations.push(c);

      if (_this.enableFriction) {
        _this.frictionEquations.push(_this.createFrictionFromContact(c));
      }

      return 1;
    };

    this.circleParticle = function (circleBody, circleShape, circleOffset, _circleAngle, particleBody, particleShape, particleOffset, _particleAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const dist = tmp1;
      const circleRadius = circleShape.radius;
      subtract(dist, particleOffset, circleOffset);

      if (squaredLength(dist) > circleRadius * circleRadius) {
        return 0;
      }

      if (justTest) {
        return 1;
      }

      const c = _this.createContactEquation(circleBody, particleBody, circleShape, particleShape);

      const normalA = c.normalA;
      const contactPointA = c.contactPointA;
      const contactPointB = c.contactPointB;
      copy(normalA, dist);
      normalize(normalA, normalA); // Vector from circle to contact point is the normal times the circle radius

      scale(contactPointA, normalA, circleRadius);
      add(contactPointA, contactPointA, circleOffset);
      subtract(contactPointA, contactPointA, circleBody.position); // Vector from particle center to contact point is zero

      subtract(contactPointB, particleOffset, particleBody.position);

      _this.contactEquations.push(c);

      if (_this.enableFriction) {
        _this.frictionEquations.push(_this.createFrictionFromContact(c));
      }

      return 1;
    };

    this.planeCapsule = function (planeBody, planeShape, planeOffset, planeAngle, capsuleBody, capsuleShape, capsuleOffset, capsuleAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const end1 = planeCapsule_tmp1;
      const end2 = planeCapsule_tmp2;
      const circle = planeCapsule_tmpCircle;
      const halfLength = capsuleShape.length / 2; // Compute world end positions

      set(end1, -halfLength, 0);
      set(end2, halfLength, 0);
      toGlobalFrame(end1, end1, capsuleOffset, capsuleAngle);
      toGlobalFrame(end2, end2, capsuleOffset, capsuleAngle);
      circle.radius = capsuleShape.radius;
      let enableFrictionBefore = true; // Temporarily turn off friction

      if (_this.enableFrictionReduction) {
        enableFrictionBefore = _this.enableFriction;
        _this.enableFriction = false;
      } // Do Narrowphase as two circles


      const numContacts1 = _this.circlePlane(capsuleBody, circle, end1, 0, planeBody, planeShape, planeOffset, planeAngle, justTest),
            numContacts2 = _this.circlePlane(capsuleBody, circle, end2, 0, planeBody, planeShape, planeOffset, planeAngle, justTest); // Restore friction


      if (_this.enableFrictionReduction) {
        _this.enableFriction = enableFrictionBefore;
      }

      if (justTest) {
        return numContacts1 + numContacts2;
      } else {
        const numTotal = numContacts1 + numContacts2;

        if (_this.enableFrictionReduction) {
          if (numTotal) {
            _this.frictionEquations.push(_this.createFrictionFromAverage(numTotal));
          }
        }

        return numTotal;
      }
    };

    this.circlePlane = function (circleBody, circleShape, circleOffset, _circleAngle, planeBody, planeShape, planeOffset, planeAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const circleRadius = circleShape.radius; // Vector from plane to circle

      const planeToCircle = tmp1,
            worldNormal = tmp2,
            temp = tmp3;
      subtract(planeToCircle, circleOffset, planeOffset); // World plane normal

      rotate(worldNormal, yAxis$3, planeAngle); // Normal direction distance

      const d = dot(worldNormal, planeToCircle);

      if (d > circleRadius) {
        return 0; // No overlap. Abort.
      }

      if (justTest) {
        return 1;
      } // Create contact


      const contact = _this.createContactEquation(planeBody, circleBody, planeShape, circleShape); // ni is the plane world normal


      copy(contact.normalA, worldNormal); // rj is the vector from circle center to the contact point

      const cpB = contact.contactPointB;
      scale(cpB, contact.normalA, -circleRadius);
      add(cpB, cpB, circleOffset);
      subtract(cpB, cpB, circleBody.position); // ri is the distance from plane center to contact.

      const cpA = contact.contactPointA;
      scale(temp, contact.normalA, d);
      subtract(cpA, planeToCircle, temp); // Subtract normal distance vector from the distance vector

      add(cpA, cpA, planeOffset);
      subtract(cpA, cpA, planeBody.position);

      _this.contactEquations.push(contact);

      if (_this.enableFriction) {
        _this.frictionEquations.push(_this.createFrictionFromContact(contact));
      }

      return 1;
    };

    this.convexConvex = function (bodyA, polyA, positionA, angleA, bodyB, polyB, positionB, angleB, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const totalRadius = 0;
      const dist = convexConvex_dist;
      const tempVec = convexConvex_tempVec;
      const tmpVec = convexConvex_tmpVec;
      const edgeA = findMaxSeparation(tempVec, polyA, positionA, angleA, polyB, positionB, angleB);
      const separationA = tempVec[0];

      if (separationA > totalRadius) {
        return 0;
      }

      const edgeB = findMaxSeparation(tmpVec, polyB, positionB, angleB, polyA, positionA, angleA);
      const separationB = tmpVec[0];

      if (separationB > totalRadius) {
        return 0;
      }

      let poly1; // reference polygon

      let poly2; // incident polygon

      let position1;
      let position2;
      let angle1;
      let angle2;
      let body1;
      let body2;
      let edge1; // reference edge

      if (separationB > separationA) {
        poly1 = polyB;
        poly2 = polyA;
        body1 = bodyB;
        body2 = bodyA;
        position1 = positionB;
        angle1 = angleB;
        position2 = positionA;
        angle2 = angleA;
        edge1 = edgeB;
      } else {
        poly1 = polyA;
        poly2 = polyB;
        body1 = bodyA;
        body2 = bodyB;
        position1 = positionA;
        angle1 = angleA;
        position2 = positionB;
        angle2 = angleB;
        edge1 = edgeA;
      }

      const incidentEdge = convexConvex_incidentEdge;
      findIncidentEdge(incidentEdge, poly1, position1, angle1, edge1, poly2, position2, angle2);
      const count1 = poly1.vertices.length;
      const vertices1 = poly1.vertices;
      const iv1 = edge1;
      const iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0;
      const v11 = convexConvex_v11;
      const v12 = convexConvex_v12;
      copy(v11, vertices1[iv1]);
      copy(v12, vertices1[iv2]);
      const localTangent = convexConvex_localTangent;
      subtract(localTangent, v12, v11);
      normalize(localTangent, localTangent);
      const localNormal = convexConvex_localNormal;
      crossVZ(localNormal, localTangent, 1.0);
      const planePoint = convexConvex_planePoint;
      add(planePoint, v11, v12);
      scale(planePoint, planePoint, 0.5);
      const tangent = convexConvex_tangent; // tangent in world space

      rotate(tangent, localTangent, angle1);
      const normal = convexConvex_normal; // normal in world space

      crossVZ(normal, tangent, 1.0);
      toGlobalFrame(v11, v11, position1, angle1);
      toGlobalFrame(v12, v12, position1, angle1); // Face offset.

      const frontOffset = dot(normal, v11); // Side offsets, extended by polytope skin thickness.

      const sideOffset1 = -dot(tangent, v11) + totalRadius;
      const sideOffset2 = dot(tangent, v12) + totalRadius; // Clip incident edge against extruded edge1 side edges.

      const clipPoints1 = convexConvex_clipPoints1;
      const clipPoints2 = convexConvex_clipPoints2;
      let np = 0; // Clip to box side 1

      const negativeTangent = convexConvex_negativeTangent;
      scale(negativeTangent, tangent, -1);
      np = clipSegmentToLine(clipPoints1, incidentEdge, negativeTangent, sideOffset1);

      if (np < 2) {
        return 0;
      } // Clip to negative box side 1


      np = clipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);

      if (np < 2) {
        return 0;
      }

      let pointCount = 0;

      for (let i = 0; i < maxManifoldPoints; ++i) {
        const separation = dot(normal, clipPoints2[i]) - frontOffset;

        if (separation <= totalRadius) {
          if (justTest) {
            return 1;
          }

          ++pointCount;

          const c = _this.createContactEquation(body1, body2, poly1, poly2);

          copy(c.normalA, normal);
          copy(c.contactPointB, clipPoints2[i]);
          subtract(c.contactPointB, c.contactPointB, body2.position);
          scale(dist, normal, -separation);
          add(c.contactPointA, clipPoints2[i], dist);
          subtract(c.contactPointA, c.contactPointA, body1.position);

          _this.contactEquations.push(c);

          if (_this.enableFriction && !_this.enableFrictionReduction) {
            _this.frictionEquations.push(_this.createFrictionFromContact(c));
          }
        }
      }

      if (pointCount && _this.enableFrictionReduction && _this.enableFriction) {
        _this.frictionEquations.push(_this.createFrictionFromAverage(pointCount));
      }

      return pointCount;
    };

    this.circleHeightfield = function (circleBody, circleShape, circlePos, _circleAngle, hfBody, hfShape, hfPos, _fAngle, justTest, radius) {
      if (justTest === void 0) {
        justTest = false;
      }

      if (radius === void 0) {
        radius = circleShape.radius;
      }

      const data = hfShape.heights;
      const w = hfShape.elementWidth;
      const dist = circleHeightfield_dist;
      const candidate = circleHeightfield_candidate;
      const minCandidate = circleHeightfield_minCandidate;
      const minCandidateNormal = circleHeightfield_minCandidateNormal;
      const worldNormal = circleHeightfield_worldNormal;
      const v0 = circleHeightfield_v0;
      const v1 = circleHeightfield_v1; // Get the index of the points to test against

      let idxA = Math.floor((circlePos[0] - radius - hfPos[0]) / w),
          idxB = Math.ceil((circlePos[0] + radius - hfPos[0]) / w);
      /*if(idxB < 0 || idxA >= data.length)
          return justTest ? false : 0;*/

      if (idxA < 0) {
        idxA = 0;
      }

      if (idxB >= data.length) {
        idxB = data.length - 1;
      } // Get max and min


      let max = data[idxA],
          min = data[idxB];

      for (let i = idxA; i < idxB; i++) {
        if (data[i] < min) {
          min = data[i];
        }

        if (data[i] > max) {
          max = data[i];
        }
      }

      if (circlePos[1] - radius > max) {
        return 0;
      }
      /*
      if(circlePos[1]+radius < min){
          // Below the minimum point... We can just guess.
          // TODO
      }
      */
      // 1. Check so center of circle is not inside the field. If it is, this wont work...
      // 2. For each edge
      // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
      // 2. 2. Check if point is inside.


      let found = false; // Check all edges first

      for (let i = idxA; i < idxB; i++) {
        // Get points
        set(v0, i * w, data[i]);
        set(v1, (i + 1) * w, data[i + 1]);
        add(v0, v0, hfPos); // @todo transform circle to local heightfield space instead

        add(v1, v1, hfPos); // Get normal

        subtract(worldNormal, v1, v0);
        rotate(worldNormal, worldNormal, Math.PI / 2);
        normalize(worldNormal, worldNormal); // Get point on circle, closest to the edge

        scale(candidate, worldNormal, -radius);
        add(candidate, candidate, circlePos); // Distance from v0 to the candidate point

        subtract(dist, candidate, v0); // Check if it is in the element "stick"

        const d = dot(dist, worldNormal);

        if (candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0) {
          if (justTest) {
            return 1;
          }

          found = true; // Store the candidate point, projected to the edge

          scale(dist, worldNormal, -d);
          add(minCandidate, candidate, dist);
          copy(minCandidateNormal, worldNormal);

          const c = _this.createContactEquation(hfBody, circleBody, hfShape, circleShape); // Normal is out of the heightfield


          copy(c.normalA, minCandidateNormal); // Vector from circle to heightfield

          scale(c.contactPointB, c.normalA, -radius);
          add(c.contactPointB, c.contactPointB, circlePos);
          subtract(c.contactPointB, c.contactPointB, circleBody.position);
          copy(c.contactPointA, minCandidate);
          subtract(c.contactPointA, c.contactPointA, hfBody.position);

          _this.contactEquations.push(c);

          if (_this.enableFriction) {
            _this.frictionEquations.push(_this.createFrictionFromContact(c));
          }
        }
      } // Check all vertices


      found = false;

      if (radius > 0) {
        for (let i = idxA; i <= idxB; i++) {
          // Get point
          set(v0, i * w, data[i]);
          add(v0, v0, hfPos);
          subtract(dist, circlePos, v0);

          if (squaredLength(dist) < Math.pow(radius, 2)) {
            if (justTest) {
              return 1;
            }

            found = true;

            const c = _this.createContactEquation(hfBody, circleBody, hfShape, circleShape); // Construct normal - out of heightfield


            copy(c.normalA, dist);
            normalize(c.normalA, c.normalA);
            scale(c.contactPointB, c.normalA, -radius);
            add(c.contactPointB, c.contactPointB, circlePos);
            subtract(c.contactPointB, c.contactPointB, circleBody.position);
            subtract(c.contactPointA, v0, hfPos);
            add(c.contactPointA, c.contactPointA, hfPos);
            subtract(c.contactPointA, c.contactPointA, hfBody.position);

            _this.contactEquations.push(c);

            if (_this.enableFriction) {
              _this.frictionEquations.push(_this.createFrictionFromContact(c));
            }
          }
        }
      }

      if (found) {
        return 1;
      }

      return 0;
    };

    this.convexHeightfield = function (convexBody, convexShape, convexPos, convexAngle, hfBody, hfShape, hfPos, _hfAngle, justTest) {
      if (justTest === void 0) {
        justTest = false;
      }

      const data = hfShape.heights,
            w = hfShape.elementWidth,
            v0 = convexHeightfield_v0,
            v1 = convexHeightfield_v1,
            tilePos = convexHeightfield_tilePos,
            tileConvex = convexHeightfield_tempConvexShape; // Get the index of the points to test against

      let idxA = Math.floor((convexBody.aabb.lowerBound[0] - hfPos[0]) / w),
          idxB = Math.ceil((convexBody.aabb.upperBound[0] - hfPos[0]) / w);

      if (idxA < 0) {
        idxA = 0;
      }

      if (idxB >= data.length) {
        idxB = data.length - 1;
      } // Get max and min


      let max = data[idxA],
          min = data[idxB];

      for (let i = idxA; i < idxB; i++) {
        if (data[i] < min) {
          min = data[i];
        }

        if (data[i] > max) {
          max = data[i];
        }
      }

      if (convexBody.aabb.lowerBound[1] > max) {
        return 0;
      }

      let numContacts = 0; // Loop over all edges
      // @todo If possible, construct a convex from several data points (need o check if the points make a convex shape)
      // @todo transform convex to local heightfield space.
      // @todo bail out if the heightfield tile is not tall enough.

      for (let i = idxA; i < idxB; i++) {
        // Get points
        set(v0, i * w, data[i]);
        set(v1, (i + 1) * w, data[i + 1]);
        add(v0, v0, hfPos);
        add(v1, v1, hfPos); // Construct a convex

        const tileHeight = 100; // todo

        set(tilePos, (v1[0] + v0[0]) * 0.5, (v1[1] + v0[1] - tileHeight) * 0.5);
        subtract(tileConvex.vertices[0], v1, tilePos);
        subtract(tileConvex.vertices[1], v0, tilePos);
        copy(tileConvex.vertices[2], tileConvex.vertices[1]);
        copy(tileConvex.vertices[3], tileConvex.vertices[0]);
        tileConvex.vertices[2][1] -= tileHeight;
        tileConvex.vertices[3][1] -= tileHeight;
        tileConvex.updateNormals(); // Do convex collision

        numContacts += _this.convexConvex(convexBody, convexShape, convexPos, convexAngle, hfBody, tileConvex, tilePos, 0, justTest);
      }

      return numContacts;
    };

    this.narrowphases = {
      [Shape.CONVEX | Shape.LINE]: this.convexLine,
      [Shape.LINE | Shape.BOX]: this.lineBox,
      [Shape.CONVEX | Shape.CAPSULE]: this.convexCapsule,
      [Shape.BOX | Shape.CAPSULE]: this.convexCapsule,
      [Shape.LINE | Shape.CAPSULE]: this.lineCapsule,
      [Shape.CAPSULE]: this.capsuleCapsule,
      [Shape.LINE]: this.lineLine,
      [Shape.PLANE | Shape.LINE]: this.planeLine,
      [Shape.PARTICLE | Shape.CAPSULE]: this.particleCapsule,
      [Shape.CIRCLE | Shape.LINE]: this.circleLine,
      [Shape.CIRCLE | Shape.CAPSULE]: this.circleCapsule,
      [Shape.CIRCLE | Shape.CONVEX]: this.circleConvex,
      [Shape.CIRCLE | Shape.BOX]: this.circleConvex,
      [Shape.PARTICLE | Shape.CONVEX]: this.particleConvex,
      [Shape.PARTICLE | Shape.BOX]: this.particleConvex,
      [Shape.CIRCLE]: this.circleCircle,
      [Shape.PLANE | Shape.CONVEX]: this.planeConvex,
      [Shape.PLANE | Shape.BOX]: this.planeConvex,
      [Shape.PARTICLE | Shape.PLANE]: this.particlePlane,
      [Shape.CIRCLE | Shape.PARTICLE]: this.circleParticle,
      [Shape.PLANE | Shape.CAPSULE]: this.planeCapsule,
      [Shape.CIRCLE | Shape.PLANE]: this.circlePlane,
      [Shape.CONVEX]: this.convexConvex,
      [Shape.CONVEX | Shape.BOX]: this.convexConvex,
      [Shape.BOX]: this.convexConvex,
      [Shape.CIRCLE | Shape.HEIGHTFIELD]: this.circleHeightfield,
      [Shape.BOX | Shape.HEIGHTFIELD]: this.convexHeightfield,
      [Shape.CONVEX | Shape.HEIGHTFIELD]: this.convexHeightfield
    };
    this.contactEquations = [];
    this.frictionEquations = [];
    this.enableFriction = true;
    this.enabledEquations = true;
    this.slipForce = 10.0;
    this.contactEquationPool = new ContactEquationPool({
      size: 32
    });
    this.frictionEquationPool = new FrictionEquationPool({
      size: 64
    });
    this.enableFrictionReduction = true;
    this.collidingBodiesLastStep = new TupleDictionary();
    this.currentContactMaterial = null;
  }

  bodiesOverlap(bodyA, bodyB, checkCollisionMasks) {
    const shapePositionA = bodiesOverlap_shapePositionA;
    const shapePositionB = bodiesOverlap_shapePositionB; // Loop over all shapes of bodyA

    for (let k = 0, Nshapesi = bodyA.shapes.length; k !== Nshapesi; k++) {
      const shapeA = bodyA.shapes[k]; // All shapes of body j

      for (let l = 0, Nshapesj = bodyB.shapes.length; l !== Nshapesj; l++) {
        const shapeB = bodyB.shapes[l]; // Check collision groups and masks

        if (checkCollisionMasks && !((shapeA.collisionGroup & shapeB.collisionMask) !== 0 && (shapeB.collisionGroup & shapeA.collisionMask) !== 0)) {
          return false;
        }

        bodyA.toWorldFrame(shapePositionA, shapeA.position);
        bodyB.toWorldFrame(shapePositionB, shapeB.position);

        if (shapeA.type <= shapeB.type) {
          if (this.narrowphases[shapeA.type | shapeB.type](bodyA, shapeA, shapePositionA, shapeA.angle + bodyA.angle, bodyB, shapeB, shapePositionB, shapeB.angle + bodyB.angle, true)) {
            return true;
          }
        } else {
          if (this.narrowphases[shapeA.type | shapeB.type](bodyB, // @ts-expect-error todo
          shapeB, shapePositionB, shapeB.angle + bodyB.angle, bodyA, shapeA, shapePositionA, shapeA.angle + bodyA.angle, true)) {
            return true;
          }
        }
      }
    }

    return false;
  }
  /**
   * Check if the bodies were in contact since the last reset().
   * @param bodyA
   * @param bodyB
   * @returns
   */


  collidedLastStep(bodyA, bodyB) {
    const id1 = bodyA.id | 0;
    const id2 = bodyB.id | 0;
    return !!this.collidingBodiesLastStep.get(id1, id2);
  }
  /**
   * Throws away the old equations and gets ready to create new
   */


  reset() {
    this.collidingBodiesLastStep.reset();
    const eqs = this.contactEquations;
    let l = eqs.length;

    while (l--) {
      const eq = eqs[l],
            id1 = eq.bodyA.id,
            id2 = eq.bodyB.id;
      this.collidingBodiesLastStep.set(id1, id2, true);
    }

    const ce = this.contactEquations;
    const fe = this.frictionEquations;

    for (let i = 0; i < ce.length; i++) {
      this.contactEquationPool.release(ce[i]);
    }

    for (let i = 0; i < fe.length; i++) {
      this.frictionEquationPool.release(fe[i]);
    } // Reset


    this.contactEquations.length = this.frictionEquations.length = 0;
  }
  /**
   * Creates a ContactEquation, either by reusing an existing object or creating a new one.
   * @param bodyA
   * @param bodyB
   * @param shapeA
   * @param shapeB
   */


  createContactEquation(bodyA, bodyB, shapeA, shapeB) {
    const c = this.contactEquationPool.get();
    const currentContactMaterial = this.currentContactMaterial;
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.enabled = this.enabledEquations;
    c.firstImpact = !this.collidedLastStep(bodyA, bodyB);
    c.restitution = currentContactMaterial.restitution;
    c.stiffness = currentContactMaterial.stiffness;
    c.relaxation = currentContactMaterial.relaxation;
    c.offset = currentContactMaterial.contactSkinSize;
    c.needsUpdate = true;
    return c;
  }
  /**
   * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
   * @param bodyA
   * @param bodyB
   * @param shapeA
   * @param shapeB
   */


  createFrictionEquation(bodyA, bodyB, shapeA, shapeB) {
    const c = this.frictionEquationPool.get();
    const currentContactMaterial = this.currentContactMaterial;
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.setSlipForce(this.slipForce);
    c.enabled = this.enabledEquations;
    c.frictionCoefficient = currentContactMaterial.friction;
    c.relativeVelocity = currentContactMaterial.surfaceVelocity;
    c.stiffness = currentContactMaterial.frictionStiffness;
    c.relaxation = currentContactMaterial.frictionRelaxation;
    c.needsUpdate = true;
    c.contactEquations.length = 0;
    return c;
  }
  /**
   * Creates a FrictionEquation given the data in the ContactEquation.
   * Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
   * @param c
   */


  createFrictionFromContact(c) {
    const eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    copy(eq.contactPointA, c.contactPointA);
    copy(eq.contactPointB, c.contactPointB);
    rotate90cw(eq.t, c.normalA);
    eq.contactEquations.push(c);
    return eq;
  }

  createFrictionFromAverage(numContacts) {
    let c = this.contactEquations[this.contactEquations.length - 1];
    const eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    const bodyA = c.bodyA;
    set(eq.contactPointA, 0, 0);
    set(eq.contactPointB, 0, 0);
    set(eq.t, 0, 0);

    for (let i = 0; i !== numContacts; i++) {
      c = this.contactEquations[this.contactEquations.length - 1 - i];

      if (c.bodyA === bodyA) {
        add(eq.t, eq.t, c.normalA);
        add(eq.contactPointA, eq.contactPointA, c.contactPointA);
        add(eq.contactPointB, eq.contactPointB, c.contactPointB);
      } else {
        subtract(eq.t, eq.t, c.normalA);
        add(eq.contactPointA, eq.contactPointA, c.contactPointB);
        add(eq.contactPointB, eq.contactPointB, c.contactPointA);
      }

      eq.contactEquations.push(c);
    }

    const invNumContacts = 1 / numContacts;
    scale(eq.contactPointA, eq.contactPointA, invNumContacts);
    scale(eq.contactPointB, eq.contactPointB, invNumContacts);
    normalize(eq.t, eq.t);
    rotate90cw(eq.t, eq.t);
    return eq;
  }
  /**
   * Convex/Line Narrowphase.
   * @todo
   * @param _convexBody
   * @param _convexShape
   * @param _convexOffset
   * @param _convexAngle
   * @param _lineBody
   * @param _lineShape
   * @param _lineOffset
   * @param _lineAngle
   * @param _justTest
   * @returns
   */


} // Temp things

const yAxis$3 = fromValues(0, 1);
const tmp1 = create();
const tmp2 = create();
const tmp3 = create();
const tmp4 = create();
const tmp5 = create();
const tmp6 = create();
const tmp7 = create();
const tmp8 = create();
const tmp9 = create();
const tmp10 = create();
const tmp11 = create();
const tmp12 = create();
const tmp13 = create();
const tmp14 = create();
const tmp15 = create();
const tmpArray = [];
const bodiesOverlap_shapePositionA = create();
const bodiesOverlap_shapePositionB = create();
const convexConvex_tempVec = create();
const convexConvex_tmpVec = create();
const convexConvex_localTangent = create();
const convexConvex_localNormal = create();
const convexConvex_planePoint = create();
const convexConvex_tangent = create();
const convexConvex_normal = create();
const convexConvex_negativeTangent = create();
const convexConvex_v11 = create();
const convexConvex_v12 = create();
const convexConvex_dist = create();
const convexConvex_clipPoints1 = [create(), create()];
const convexConvex_clipPoints2 = [create(), create()];
const convexConvex_incidentEdge = [create(), create()];
const maxManifoldPoints = 2;
const circleHeightfield_candidate = create();
const circleHeightfield_dist = create();
const circleHeightfield_v0 = create();
const circleHeightfield_v1 = create();
const circleHeightfield_minCandidate = create();
const circleHeightfield_worldNormal = create();
const circleHeightfield_minCandidateNormal = create();

function setConvexToCapsuleShapeMiddle(convexShape, capsuleShape) {
  const capsuleRadius = capsuleShape.radius;
  const halfCapsuleLength = capsuleShape.length * 0.5;
  const verts = convexShape.vertices;
  set(verts[0], -halfCapsuleLength, -capsuleRadius);
  set(verts[1], halfCapsuleLength, -capsuleRadius);
  set(verts[2], halfCapsuleLength, capsuleRadius);
  set(verts[3], -halfCapsuleLength, capsuleRadius);
}

const convexCapsule_tempRect = new Box({
  width: 1,
  height: 1
});
const convexCapsule_tempVec = create();
const capsuleCapsule_tempVec1 = create();
const capsuleCapsule_tempVec2 = create();
const capsuleCapsule_tempRect1 = new Box({
  width: 1,
  height: 1
});
const pointInConvex_localPoint = create();
const pointInConvex_r0 = create();
const pointInConvex_r1 = create();
/*
 * Check if a point is in a polygon
 */

function pointInConvex(worldPoint, convexShape, convexOffset, convexAngle) {
  const localPoint = pointInConvex_localPoint;
  const r0 = pointInConvex_r0;
  const r1 = pointInConvex_r1;
  const verts = convexShape.vertices;
  let lastCross = null;
  toLocalFrame(localPoint, worldPoint, convexOffset, convexAngle);

  for (let i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
    const v0 = verts[i % numVerts],
          v1 = verts[(i + 1) % numVerts];
    subtract(r0, v0, localPoint);
    subtract(r1, v1, localPoint);
    const cross = crossLength(r0, r1);

    if (lastCross === null) {
      lastCross = cross;
    } // If we got a different sign of the distance vector, the point is out of the polygon


    if (cross * lastCross < 0) {
      return false;
    }

    lastCross = cross;
  }

  return true;
}

function addsubtract(out, a, b, c) {
  out[0] = a[0] + b[0] - c[0];
  out[1] = a[1] + b[1] - c[1];
}
/*
 * Check if a point is in a polygon
 */


function pointInConvexLocal(localPoint, convexShape) {
  const r0 = pointInConvex_r0;
  const r1 = pointInConvex_r1;
  const verts = convexShape.vertices;
  const numVerts = verts.length;
  let lastCross = null;

  for (let i = 0; i < numVerts + 1; i++) {
    const v0 = verts[i % numVerts],
          v1 = verts[(i + 1) % numVerts];
    subtract(r0, v0, localPoint);
    subtract(r1, v1, localPoint);
    const cross = crossLength(r0, r1);

    if (lastCross === null) {
      lastCross = cross;
    } // If we got a different sign of the distance vector, the point is out of the polygon


    if (cross * lastCross < 0) {
      return false;
    }

    lastCross = cross;
  }

  return true;
}

const planeCapsule_tmpCircle = new Circle({
  radius: 1
});
const planeCapsule_tmp1 = create();
const planeCapsule_tmp2 = create(); // Find the max separation between poly1 and poly2 using edge normals from poly1.

const findMaxSeparation_n = create();
const findMaxSeparation_v1 = create();
const findMaxSeparation_tmp = create();
const findMaxSeparation_tmp2 = create();

function findMaxSeparation(maxSeparationOut, poly1, position1, angle1, poly2, position2, angle2) {
  const count1 = poly1.vertices.length;
  const count2 = poly2.vertices.length;
  const n1s = poly1.normals;
  const v1s = poly1.vertices;
  const v2s = poly2.vertices;
  const n = findMaxSeparation_n;
  const v1 = findMaxSeparation_v1;
  const tmp = findMaxSeparation_tmp;
  const tmp2 = findMaxSeparation_tmp2;
  const angle = angle1 - angle2;
  let bestIndex = 0;
  let maxSeparation = -Number.MAX_VALUE;

  for (let i = 0; i < count1; ++i) {
    // Get poly1 normal in frame2.
    rotate(n, n1s[i], angle); // Get poly1 vertex in frame2

    toGlobalFrame(tmp2, v1s[i], position1, angle1);
    toLocalFrame(v1, tmp2, position2, angle2); // Find deepest point for normal i.

    let si = Number.MAX_VALUE;

    for (let j = 0; j < count2; ++j) {
      subtract(tmp, v2s[j], v1);
      const sij = dot(n, tmp);

      if (sij < si) {
        si = sij;
      }
    }

    if (si > maxSeparation) {
      maxSeparation = si;
      bestIndex = i;
    }
  } // Use a vec2 for storing the float value and always return int, for perf


  maxSeparationOut[0] = maxSeparation;
  return bestIndex;
}

const findIncidentEdge_normal1 = create();

function findIncidentEdge(clipVerticesOut, poly1, position1, angle1, edge1, poly2, position2, angle2) {
  const normals1 = poly1.normals;
  const count2 = poly2.vertices.length;
  const vertices2 = poly2.vertices;
  const normals2 = poly2.normals; // Get the normal of the reference edge in poly2's frame.

  const normal1 = findIncidentEdge_normal1;
  rotate(normal1, normals1[edge1], angle1 - angle2); // Find the incident edge on poly2.

  let index = 0;
  let minDot = Number.MAX_VALUE;

  for (let i = 0; i < count2; ++i) {
    const dot$1 = dot(normal1, normals2[i]);

    if (dot$1 < minDot) {
      minDot = dot$1;
      index = i;
    }
  } // Build the clip vertices for the incident edge.


  const i1 = index;
  const i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  toGlobalFrame(clipVerticesOut[0], vertices2[i1], position2, angle2);
  toGlobalFrame(clipVerticesOut[1], vertices2[i2], position2, angle2);
}

function clipSegmentToLine(vOut, vIn, normal, offset) {
  // Start with no output points
  let numOut = 0; // Calculate the distance of end points to the line

  const distance0 = dot(normal, vIn[0]) - offset;
  const distance1 = dot(normal, vIn[1]) - offset; // If the points are behind the plane

  if (distance0 <= 0.0) {
    copy(vOut[numOut++], vIn[0]);
  }

  if (distance1 <= 0.0) {
    copy(vOut[numOut++], vIn[1]);
  } // If the points are on different sides of the plane


  if (distance0 * distance1 < 0.0) {
    // Find intersection point of edge and plane
    const interp = distance0 / (distance0 - distance1);
    const v = vOut[numOut];
    subtract(v, vIn[1], vIn[0]);
    scale(v, v, interp);
    add(v, v, vIn[0]);
    ++numOut;
  }

  return numOut;
}

const convexHeightfield_v0 = create();
const convexHeightfield_v1 = create();
const convexHeightfield_tilePos = create();
const convexHeightfield_tempConvexShape = new Convex({
  vertices: [create(), create(), create(), create()]
});

/**
 * Sweep and prune broadphase along one axis.
 */

class SAPBroadphase extends Broadphase {
  /**
   * List of bodies currently in the broadphase.
   */
  constructor() {
    super(Broadphase.SAP);
    this.axisList = [];
    this.axisIndex = 0;

    this.addBodyHandler = e => {
      this.axisList.push(e.body);
    };

    this.removeBodyHandler = e => {
      // Remove from list
      const idx = this.axisList.indexOf(e.body);

      if (idx !== -1) {
        this.axisList.splice(idx, 1);
      }
    };
  }
  /**
   * Change the world
   * @param world
   */


  setWorld(world) {
    // Clear the old axis array
    this.axisList.length = 0; // Add all bodies from the new world

    appendArray(this.axisList, world.bodies); // Remove old handlers, if any

    world.off('addBody', this.addBodyHandler).off('removeBody', this.removeBodyHandler); // Add handlers to update the list of bodies.

    world.on('addBody', this.addBodyHandler).on('removeBody', this.removeBodyHandler);
    this.world = world;
  }

  sortList() {
    const bodies = this.axisList;
    const axisIndex = this.axisIndex; // Sort the lists

    sortAxisList(bodies, axisIndex);
  }
  /**
   * Get the colliding pairs
   */


  getCollisionPairs(_world) {
    const bodies = this.axisList;
    const result = this.result;
    const axisIndex = this.axisIndex;
    result.length = 0; // Update all AABBs if needed

    let l = bodies.length;

    while (l--) {
      const b = bodies[l];

      if (b.aabbNeedsUpdate) {
        b.updateAABB();
      }
    } // Sort the lists


    this.sortList(); // Look through the X list

    for (let i = 0, N = bodies.length | 0; i !== N; i++) {
      const bi = bodies[i];

      for (let j = i + 1; j < N; j++) {
        const bj = bodies[j]; // Bounds overlap?

        const overlaps = bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex];

        if (!overlaps) {
          break;
        }

        if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
          result.push(bi, bj);
        }
      }
    }

    return result;
  }
  /**
   * Returns all the bodies within an AABB.
   * @param world
   * @param aabb
   * @param result An array to store resulting bodies in.
   * @return
   * @todo since the list is sorted, optimization can be done
   */


  aabbQuery(world, aabb, result) {
    if (result === void 0) {
      result = [];
    }

    this.sortList();
    const axisList = this.axisList;

    for (let i = 0; i < axisList.length; i++) {
      const b = axisList[i];

      if (b.aabbNeedsUpdate) {
        b.updateAABB();
      }

      if (b.aabb.overlaps(aabb)) {
        result.push(b);
      }
    }

    return result;
  }

}

function sortAxisList(a, axisIndex) {
  axisIndex = axisIndex | 0;

  for (let i = 1, l = a.length; i < l; i++) {
    const v = a[i];
    let j;

    for (j = i - 1; j >= 0; j--) {
      if (a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]) {
        break;
      }

      a[j + 1] = a[j];
    }

    a[j + 1] = v;
  }

  return a;
}

/**
 * Base constraint class.
 */
class Constraint {
  constructor(bodyA, bodyB, type, options) {
    if (type === void 0) {
      type = Constraint.OTHER;
    }

    if (options === void 0) {
      options = {};
    }

    this.type = type;
    this.equations = [];
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.collideConnected = options.collideConnected ?? true; // Wake up bodies when connected

    if (options.wakeUpBodies !== false) {
      if (bodyA) {
        bodyA.wakeUp();
      }

      if (bodyB) {
        bodyB.wakeUp();
      }
    }
  }
  /**
   * Updates the internal constraint parameters before solve.
   */


  update() {
    throw new Error('method update() not implemented in this Constraint subclass!');
  }
  /**
   * Set stiffness for this constraint.
   * @param stiffness
   */


  setStiffness(stiffness) {
    const eqs = this.equations;

    for (let i = 0; i !== eqs.length; i++) {
      const eq = eqs[i];
      eq.stiffness = stiffness;
      eq.needsUpdate = true;
    }
  }
  /**
   * Set relaxation for this constraint.
   * @param relaxation
   */


  setRelaxation(relaxation) {
    const eqs = this.equations;

    for (let i = 0; i !== eqs.length; i++) {
      const eq = eqs[i];
      eq.relaxation = relaxation;
      eq.needsUpdate = true;
    }
  }
  /**
   * Set max bias for this constraint.
   * @param maxBias
   */


  setMaxBias(maxBias) {
    const eqs = this.equations;

    for (let i = 0; i !== eqs.length; i++) {
      const eq = eqs[i];
      eq.maxBias = maxBias;
    }
  }

}
Constraint.OTHER = -1;
Constraint.DISTANCE = 1;
Constraint.GEAR = 2;
Constraint.LOCK = 3;
Constraint.PRISMATIC = 4;
Constraint.REVOLUTE = 5;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @example
 *     // If distance is not given as an option, then the current distance between the bodies is used.
 *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new DistanceConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     // Manually set the distance and anchors
 *     var constraint = new DistanceConstraint(bodyA, bodyB, {
 *         distance: 1,          // Distance to keep between the points
 *         localAnchorA: [1, 0], // Point on bodyA
 *         localAnchorB: [-1, 0] // Point on bodyB
 *     });
 *     world.addConstraint(constraint);
 */
class DistanceConstraint extends Constraint {
  /**
   * The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
   */

  /**
   * The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
   */

  /**
   * The distance to keep between the anchor points. Defaults to the current distance between the bodies.
   */

  /**
   * Maximum force to apply.
   */

  /**
   * If the upper limit is enabled or not.
   */

  /**
   * The upper constraint limit.
   */

  /**
   * If the lower limit is enabled or not.
   */

  /**
   * The lower constraint limit.
   */

  /**
   * Current constraint position. This is equal to the current distance between the world anchor points.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, Constraint.DISTANCE, options);
    this.localAnchorA = options.localAnchorA ? clone(options.localAnchorA) : create();
    this.localAnchorB = options.localAnchorB ? clone(options.localAnchorB) : create();
    const localAnchorA = this.localAnchorA;
    const localAnchorB = this.localAnchorB;
    this.upperLimit = options.upperLimit ?? 1;
    this.upperLimitEnabled = options.upperLimit !== undefined;
    this.lowerLimit = options.lowerLimit ?? 0;
    this.lowerLimitEnabled = options.lowerLimit !== undefined;

    if (typeof options.distance === 'number') {
      this.distance = options.distance;
    } else {
      // Use the current world distance between the world anchor points.
      const worldAnchorA = create();
      const worldAnchorB = create();
      const r = create(); // Transform local anchors to world

      rotate(worldAnchorA, localAnchorA, bodyA.angle);
      rotate(worldAnchorB, localAnchorB, bodyB.angle);
      add(r, bodyB.position, worldAnchorB);
      subtract(r, r, worldAnchorA);
      subtract(r, r, bodyA.position);
      this.distance = length(r);
    }

    let maxForce;

    if (typeof options.maxForce === 'undefined') {
      maxForce = Number.MAX_VALUE;
    } else {
      maxForce = options.maxForce;
    }

    const normal = new Equation(bodyA, bodyB, -maxForce, maxForce); // Just in the normal direction

    this.equations = [normal];
    this.maxForce = maxForce; // g = (xi - xj).dot(n)
    // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'
    // ...and if we were to include offset points:
    // g =
    //      (xj + rj - xi - ri).dot(n) - distance
    //
    // dg/dt =
    //      (vj + wj x rj - vi - wi x ri).dot(n) =
    //      { term 2 is near zero } =
    //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
    //      G * W
    //
    // => G = [-n -rixn n rjxn]

    const r = create();
    const ri = create(); // worldAnchorA

    const rj = create(); // worldAnchorB
    // eslint-disable-next-line @typescript-eslint/no-this-alias

    const that = this;

    normal.computeGq = function () {
      const bodyA = this.bodyA,
            bodyB = this.bodyB,
            xi = bodyA.position,
            xj = bodyB.position; // Transform local anchors to world

      rotate(ri, localAnchorA, bodyA.angle);
      rotate(rj, localAnchorB, bodyB.angle);
      add(r, xj, rj);
      subtract(r, r, ri);
      subtract(r, r, xi);
      return length(r) - that.distance;
    }; // Make the contact constraint bilateral


    this.setMaxForce(maxForce);
    this.position = 0;
  }
  /**
   * Set the max force to be used
   * @param maxForce
   */


  setMaxForce(maxForce) {
    const normal = this.equations[0];
    normal.minForce = -maxForce;
    normal.maxForce = maxForce;
  }
  /**
   * Get the max force
   */


  getMaxForce() {
    const normal = this.equations[0];
    return normal.maxForce;
  }
  /**
   * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
   */


  update() {
    const normal = this.equations[0],
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          xi = bodyA.position,
          xj = bodyB.position,
          normalEquation = this.equations[0],
          G = normal.G; // Transform local anchors to world

    rotate(ri, this.localAnchorA, bodyA.angle);
    rotate(rj, this.localAnchorB, bodyB.angle); // Get world anchor points and normal

    add(n, xj, rj);
    subtract(n, n, ri);
    subtract(n, n, xi);
    this.position = length(n);
    let violating = false;

    if (this.upperLimitEnabled) {
      if (this.position > this.upperLimit) {
        normalEquation.maxForce = 0;
        normalEquation.minForce = -this.maxForce;
        this.distance = this.upperLimit;
        violating = true;
      }
    }

    if (this.lowerLimitEnabled) {
      if (this.position < this.lowerLimit) {
        normalEquation.maxForce = this.maxForce;
        normalEquation.minForce = 0;
        this.distance = this.lowerLimit;
        violating = true;
      }
    }

    if ((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating) {
      // No constraint needed.
      normalEquation.enabled = false;
      return;
    }

    normalEquation.enabled = true;
    normalize(n, n); // Caluclate cross products

    const rixn = crossLength(ri, n),
          rjxn = crossLength(rj, n); // G = [-n -rixn n rjxn]

    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn;
  }

}
const n = create();
const ri = create(); // worldAnchorA

const rj = create(); // worldAnchorB

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 */
class AngleLockEquation extends Equation {
  /**
   * The gear ratio.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.angle = options.angle || 0;
    this.ratio = options.ratio ?? 1;
    this.setRatio(this.ratio);
  }

  setRatio(ratio) {
    const G = this.G;
    G[2] = ratio;
    G[5] = -1;
    this.ratio = ratio;
  }

  setMaxTorque(torque) {
    this.maxForce = torque;
    this.minForce = -torque;
  }

  computeGq() {
    return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
  }

}

/**
 * Constrains the angle of two bodies to each other to be equal. If a gear ratio is not one, the angle of bodyA must be a multiple of the angle of bodyB.
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB, {
 *         ratio: 2,
 *         maxTorque: 1000
 *     });
 *     world.addConstraint(constraint);
 */
class GearConstraint extends Constraint {
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, Constraint.GEAR, options);
    /**
     * The gear ratio.
     */

    this.ratio = options.ratio ?? 1;
    /**
     * The relative angle
     */

    this.angle = options.angle ?? bodyB.angle - this.ratio * bodyA.angle; // Send same parameters to the equation

    const angleLockOptions = shallowClone(options);
    angleLockOptions.angle = this.angle;
    angleLockOptions.ratio = this.ratio;
    this.equations = [new AngleLockEquation(bodyA, bodyB, angleLockOptions)]; // Set max torque

    if (options.maxTorque !== undefined) {
      this.setMaxTorque(options.maxTorque);
    }
  }
  /**
   * Set the max torque for the constraint.
   * @param torque 
   */


  setMaxTorque(torque) {
    this.equations[0].setMaxTorque(torque);
  }
  /**
   * Get the max torque for the constraint.
   * @returns 
   */


  getMaxTorque() {
    return this.equations[0].maxForce;
  }

  update() {
    const eq = this.equations[0];
    const ratio = this.ratio;

    if (eq.ratio !== ratio) {
      eq.setRatio(ratio);
    }

    eq.angle = this.angle;
  }

}

/**
 * Locks the relative position and rotation between two bodies.
 *
 * @example
 *     // Locks the relative position and rotation between bodyA and bodyB
 *     var constraint = new LockConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 */
class LockConstraint extends Constraint {
  /**
   * The offset of bodyB in bodyA's frame.
   */

  /**
   * The offset angle of bodyB in bodyA's frame.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, Constraint.LOCK, options);
    const maxForce = typeof options.maxForce === 'undefined' ? Number.MAX_VALUE : options.maxForce; // Use 3 equations:
    // gx =   (xj - xi - l) * xhat = 0
    // gy =   (xj - xi - l) * yhat = 0
    // gr =   (xi - xj + r) * that = 0
    //
    // ...where:
    //   l is the localOffsetB vector rotated to world in bodyA frame
    //   r is the same vector but reversed and rotated from bodyB frame
    //   xhat, yhat are world axis vectors
    //   that is the tangent of r
    //
    // For the first two constraints, we get
    // G*W = (vj - vi - ldot  ) * xhat
    //     = (vj - vi - wi x l) * xhat
    //
    // Since (wi x l) * xhat = (l x xhat) * wi, we get
    // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
    //
    // The last constraint gives
    // GW = (vi - vj + wj x r) * that
    //    = [  that   0  -that  (r x t) ]

    const x = new Equation(bodyA, bodyB, -maxForce, maxForce),
          y = new Equation(bodyA, bodyB, -maxForce, maxForce),
          rot = new Equation(bodyA, bodyB, -maxForce, maxForce);
    const l = create(),
          g = create(),
          // eslint-disable-next-line @typescript-eslint/no-this-alias
    that = this;

    x.computeGq = function () {
      rotate(l, that.localOffsetB, bodyA.angle);
      subtract(g, bodyB.position, bodyA.position);
      subtract(g, g, l);
      return g[0];
    };

    y.computeGq = function () {
      rotate(l, that.localOffsetB, bodyA.angle);
      subtract(g, bodyB.position, bodyA.position);
      subtract(g, g, l);
      return g[1];
    };

    const r = create(),
          t = create();

    rot.computeGq = function () {
      rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB);
      scale(r, r, -1);
      subtract(g, bodyA.position, bodyB.position);
      add(g, g, r);
      rotate(t, r, -Math.PI / 2);
      normalize(t, t);
      return dot(g, t);
    };

    this.localOffsetB = create();

    if (options.localOffsetB) {
      copy(this.localOffsetB, options.localOffsetB);
    } else {
      // Construct from current positions
      subtract(this.localOffsetB, bodyB.position, bodyA.position);
      rotate(this.localOffsetB, this.localOffsetB, -bodyA.angle);
    }

    this.localAngleB = 0;

    if (typeof options.localAngleB === 'number') {
      this.localAngleB = options.localAngleB;
    } else {
      // Construct
      this.localAngleB = bodyB.angle - bodyA.angle;
    }

    this.equations.push(x, y, rot);
    this.setMaxForce(maxForce);
  }
  /**
   * Set the maximum force to be applied.
   * @param force
   */


  setMaxForce(force) {
    const eqs = this.equations;

    for (let i = 0; i < this.equations.length; i++) {
      eqs[i].maxForce = force;
      eqs[i].minForce = -force;
    }
  }
  /**
   * Get the max force.
   */


  getMaxForce() {
    return this.equations[0].maxForce;
  }

  update() {
    const x = this.equations[0],
          y = this.equations[1],
          rot = this.equations[2],
          bodyA = this.bodyA,
          bodyB = this.bodyB;
    rotate(l, this.localOffsetB, bodyA.angle);
    rotate(r$1, this.localOffsetB, bodyB.angle - this.localAngleB);
    scale(r$1, r$1, -1);
    rotate(t, r$1, Math.PI / 2);
    normalize(t, t);
    x.G[0] = -1;
    x.G[1] = 0;
    x.G[2] = -crossLength(l, xAxis$2);
    x.G[3] = 1;
    y.G[0] = 0;
    y.G[1] = -1;
    y.G[2] = -crossLength(l, yAxis$2);
    y.G[4] = 1;
    rot.G[0] = -t[0];
    rot.G[1] = -t[1];
    rot.G[3] = t[0];
    rot.G[4] = t[1];
    rot.G[5] = crossLength(r$1, t);
  }

}
const l = create();
const r$1 = create();
const t = create();
const xAxis$2 = fromValues(1, 0);
const yAxis$2 = fromValues(0, 1);

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 */
class RotationalLockEquation extends Equation {
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.angle = options.angle || 0;
    const G = this.G;
    G[2] = 1;
    G[5] = -1;
  }

  computeGq() {
    rotate(worldVectorA, xAxis$1, this.bodyA.angle + this.angle);
    rotate(worldVectorB, yAxis$1, this.bodyB.angle);
    return dot(worldVectorA, worldVectorB);
  }

}
const worldVectorA = create();
const worldVectorB = create();
const xAxis$1 = fromValues(1, 0);
const yAxis$1 = fromValues(0, 1);

/**
 * Constraint that only allows bodies to move along a line, relative to each other.
 * 
 * Also called "slider constraint".
 * 
 * @see http://www.iforce2d.net/b2dtut/joints-prismatic
 *
 * @todo Ability to create using only a point and a worldAxis
 *
 * @example
 *     var constraint = new PrismaticConstraint(bodyA, bodyB, {
 *         localAxisA: [0, 1]
 *     });
 *     world.addConstraint(constraint);
 */
class PrismaticConstraint extends Constraint {
  /**
   * The position of anchor A relative to anchor B, along the constraint axis.
   */

  /**
   * Set to true to enable lower limit.
   */

  /**
   * Set to true to enable upper limit.
   */

  /**
   * Lower constraint limit. The constraint position is forced to be larger than this value.
   */

  /**
   * Upper constraint limit. The constraint position is forced to be smaller than this value.
   */

  /**
   * Equation used for the motor.
   */

  /**
   * The current motor state. Enable or disable the motor using .enableMotor
   */

  /**
   * Set the target speed for the motor.
   */

  /**
   * Max force for the motor
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, Constraint.PRISMATIC, options); // Get anchors

    const localAnchorA = create();
    const localAxisA = fromValues(1, 0);
    const localAnchorB = create();

    if (options.localAnchorA) {
      copy(localAnchorA, options.localAnchorA);
    }

    if (options.localAxisA) {
      copy(localAxisA, options.localAxisA);
    }

    if (options.localAnchorB) {
      copy(localAnchorB, options.localAnchorB);
    }

    this.localAnchorA = localAnchorA;
    this.localAnchorB = localAnchorB;
    this.localAxisA = localAxisA;
    /*
    The constraint violation for the common axis point is
     g = ( xj + rj - xi - ri ) * t   :=  gg*t
    where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.
     gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )
    Note the use of the chain rule. Now we identify the jacobian
     G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]
    The rotational part is just a rotation lock.
    */

    const maxForce = this.maxForce = options.maxForce ?? Number.MAX_VALUE; // Translational part

    const trans = new Equation(bodyA, bodyB, -maxForce, maxForce);
    const ri = create(),
          rj = create(),
          gg = create(),
          t = create();

    trans.computeGq = function () {
      // g = ( xj + rj - xi - ri ) * t
      return dot(gg, t);
    }; // @ts-expect-error untyped


    trans.updateJacobian = function () {
      const G = this.G,
            xi = bodyA.position,
            xj = bodyB.position;
      rotate(ri, localAnchorA, bodyA.angle);
      rotate(rj, localAnchorB, bodyB.angle);
      add(gg, xj, rj);
      subtract(gg, gg, xi);
      subtract(gg, gg, ri);
      rotate(t, localAxisA, bodyA.angle + Math.PI / 2);
      G[0] = -t[0];
      G[1] = -t[1];
      G[2] = -crossLength(ri, t) + crossLength(t, gg);
      G[3] = t[0];
      G[4] = t[1];
      G[5] = crossLength(rj, t);
    };

    this.equations.push(trans); // Rotational part

    if (!options.disableRotationalLock) {
      const rot = new RotationalLockEquation(bodyA, bodyB);
      this.equations.push(rot);
    }

    this.position = 0; // Is this one used at all?

    this.velocity = 0;
    this.lowerLimitEnabled = options.lowerLimit !== undefined;
    this.upperLimitEnabled = options.upperLimit !== undefined;
    this.lowerLimit = options.lowerLimit ?? 0;
    this.upperLimit = options.upperLimit ?? 1; // Equations used for limits

    this.upperLimitEquation = new ContactEquation(bodyA, bodyB);
    this.lowerLimitEquation = new ContactEquation(bodyA, bodyB); // Set max/min forces

    this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0;
    this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce;
    this.motorEquation = new Equation(bodyA, bodyB);
    this.motorEnabled = false;
    this.motorSpeed = 0; // eslint-disable-next-line @typescript-eslint/no-this-alias

    const that = this;
    const motorEquation = this.motorEquation;

    motorEquation.computeGq = function () {
      return 0;
    };

    motorEquation.computeGW = function () {
      const G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity;
      return this.gmult(G, vi, wi, vj, wj) + that.motorSpeed;
    };
  }
  /**
   * Enable the motor
   */


  enableMotor() {
    if (this.motorEnabled) {
      return;
    }

    this.equations.push(this.motorEquation);
    this.motorEnabled = true;
  }
  /**
   * Disable the rotational motor
   */


  disableMotor() {
    if (!this.motorEnabled) {
      return;
    }

    const i = this.equations.indexOf(this.motorEquation);
    this.equations.splice(i, 1);
    this.motorEnabled = false;
  }
  /**
   * Set the constraint limits.
   * @param lower lower limit
   * @param upper upper limit
   */


  setLimits(lower, upper) {
    if (typeof lower === 'number') {
      this.lowerLimit = lower;
      this.lowerLimitEnabled = true;
    } else {
      this.lowerLimit = lower;
      this.lowerLimitEnabled = false;
    }

    if (typeof upper === 'number') {
      this.upperLimit = upper;
      this.upperLimitEnabled = true;
    } else {
      this.upperLimit = upper;
      this.upperLimitEnabled = false;
    }
  }
  /**
   * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
   */


  update() {
    const eqs = this.equations,
          trans = eqs[0],
          upperLimit = this.upperLimit,
          lowerLimit = this.lowerLimit,
          upperLimitEquation = this.upperLimitEquation,
          lowerLimitEquation = this.lowerLimitEquation,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          localAxisA = this.localAxisA,
          localAnchorA = this.localAnchorA,
          localAnchorB = this.localAnchorB; // @ts-expect-error untyped method set in constructor

    trans.updateJacobian(); // Transform local things to world

    rotate(worldAxisA, localAxisA, bodyA.angle);
    rotate(orientedAnchorA, localAnchorA, bodyA.angle);
    add(worldAnchorA, orientedAnchorA, bodyA.position);
    rotate(orientedAnchorB, localAnchorB, bodyB.angle);
    add(worldAnchorB, orientedAnchorB, bodyB.position);
    const relPosition = this.position = dot(worldAnchorB, worldAxisA) - dot(worldAnchorA, worldAxisA); // Motor

    if (this.motorEnabled) {
      // G = [ a     a x ri   -a   -a x rj ]
      const G = this.motorEquation.G;
      G[0] = worldAxisA[0];
      G[1] = worldAxisA[1];
      G[2] = crossLength(worldAxisA, orientedAnchorB);
      G[3] = -worldAxisA[0];
      G[4] = -worldAxisA[1];
      G[5] = -crossLength(worldAxisA, orientedAnchorA);
    }
    /*
        Limits strategy:
        Add contact equation, with normal along the constraint axis.
        min/maxForce is set so the constraint is repulsive in the correct direction.
        Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.
                 ^
                |
    upperLimit x
                |    ------
        anchorB x<---|  B |
                |    |    |
        ------   |    ------
        |    |   |
        |  A |-->x anchorA
        ------   |
                x lowerLimit
                |
                axis
    */


    if (this.upperLimitEnabled && relPosition > upperLimit) {
      // Update contact constraint normal, etc
      scale(upperLimitEquation.normalA, worldAxisA, -1);
      subtract(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
      subtract(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
      scale(tmp, worldAxisA, upperLimit);
      add(upperLimitEquation.contactPointA, upperLimitEquation.contactPointA, tmp);

      if (eqs.indexOf(upperLimitEquation) === -1) {
        eqs.push(upperLimitEquation);
      }
    } else {
      const idx = eqs.indexOf(upperLimitEquation);

      if (idx !== -1) {
        eqs.splice(idx, 1);
      }
    }

    if (this.lowerLimitEnabled && relPosition < lowerLimit) {
      // Update contact constraint normal, etc
      scale(lowerLimitEquation.normalA, worldAxisA, 1);
      subtract(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
      subtract(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
      scale(tmp, worldAxisA, lowerLimit);
      subtract(lowerLimitEquation.contactPointB, lowerLimitEquation.contactPointB, tmp);

      if (eqs.indexOf(lowerLimitEquation) === -1) {
        eqs.push(lowerLimitEquation);
      }
    } else {
      const idx = eqs.indexOf(lowerLimitEquation);

      if (idx !== -1) {
        eqs.splice(idx, 1);
      }
    }
  }

}
const worldAxisA = create(),
      worldAnchorA = create(),
      worldAnchorB = create(),
      orientedAnchorA = create(),
      orientedAnchorB = create(),
      tmp = create();

/**
 * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
 */

class RotationalVelocityEquation extends Equation {
  constructor(bodyA, bodyB) {
    super(bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.relativeVelocity = 1;
    this.ratio = 1;
  }

  computeB(a, b, h) {
    const G = this.G;
    G[2] = -1;
    G[5] = this.ratio;
    const GiMf = this.computeGiMf();
    const GW = this.computeGW();
    const B = -GW * b - h * GiMf;
    return B;
  }

}

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 *
 * @example
 *     // This will create a revolute constraint between two bodies with pivot point in between them.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     world.addBody(bodyA);
 *
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     world.addBody(bodyB);
 *
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
 *     world.addConstraint(constraint);
 *
 *     // Using body-local pivot points, the constraint could have been constructed like this:
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
 */
class RevoluteConstraint extends Constraint {
  /**
   * The constraint position.
   */

  /**
   * Set to true to enable lower limit
   */

  /**
   * Set to true to enable upper limit
   */

  /**
   * The lower limit on the constraint angle.
   */

  /**
   * The upper limit on the constraint angle.
   */
  get motorEnabled() {
    return this.motorEquation.enabled;
  }

  set motorEnabled(value) {
    this.motorEquation.enabled = value;
  }

  get motorSpeed() {
    return this.motorEquation.relativeVelocity;
  }

  set motorSpeed(value) {
    this.motorEquation.relativeVelocity = value;
  }

  get motorMaxForce() {
    return this.motorEquation.maxForce;
  }

  set motorMaxForce(value) {
    const eq = this.motorEquation;
    eq.maxForce = value;
    eq.minForce = -value;
  }

  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, Constraint.REVOLUTE, options);
    const maxForce = this.maxForce = options.maxForce ?? Number.MAX_VALUE;
    const pivotA = this.pivotA = create();
    const pivotB = this.pivotB = create();

    if (options.worldPivot) {
      // Compute pivotA and pivotB
      subtract(pivotA, options.worldPivot, bodyA.position);
      subtract(pivotB, options.worldPivot, bodyB.position); // Rotate to local coordinate system

      rotate(pivotA, pivotA, -bodyA.angle);
      rotate(pivotB, pivotB, -bodyB.angle);
    } else {
      // Get pivotA and pivotB
      if (options.localPivotA) {
        copy(pivotA, options.localPivotA);
      }

      if (options.localPivotB) {
        copy(pivotB, options.localPivotB);
      }
    }

    const motorEquation = this.motorEquation = new RotationalVelocityEquation(bodyA, bodyB);
    motorEquation.enabled = false;
    const upperLimitEquation = this.upperLimitEquation = new RotationalLockEquation(bodyA, bodyB);
    const lowerLimitEquation = this.lowerLimitEquation = new RotationalLockEquation(bodyA, bodyB);
    upperLimitEquation.minForce = lowerLimitEquation.maxForce = 0; // Equations to be fed to the solver

    const eqs = this.equations = [new Equation(bodyA, bodyB, -maxForce, maxForce), new Equation(bodyA, bodyB, -maxForce, maxForce), motorEquation, upperLimitEquation, lowerLimitEquation];
    const x = eqs[0];
    const y = eqs[1];

    x.computeGq = function () {
      rotate(worldPivotA, pivotA, bodyA.angle);
      rotate(worldPivotB, pivotB, bodyB.angle);
      add(g, bodyB.position, worldPivotB);
      subtract(g, g, bodyA.position);
      subtract(g, g, worldPivotA);
      return dot(g, xAxis);
    };

    y.computeGq = function () {
      rotate(worldPivotA, pivotA, bodyA.angle);
      rotate(worldPivotB, pivotB, bodyB.angle);
      add(g, bodyB.position, worldPivotB);
      subtract(g, g, bodyA.position);
      subtract(g, g, worldPivotA);
      return dot(g, yAxis);
    };

    y.minForce = x.minForce = -maxForce;
    y.maxForce = x.maxForce = maxForce; // These never change but the angular parts do

    x.G[0] = -1;
    x.G[1] = 0;
    x.G[3] = 1;
    x.G[4] = 0;
    y.G[0] = 0;
    y.G[1] = -1;
    y.G[3] = 0;
    y.G[4] = 1;
    this.angle = 0;
    this.lowerLimitEnabled = false;
    this.upperLimitEnabled = false;
    this.lowerLimit = 0;
    this.upperLimit = 0;
  }
  /**
   * Set the constraint angle limits, and enable them.
   * @param lower the lower limit
   * @param upper the upper limit
   */


  setLimits(lower, upper) {
    this.lowerLimit = lower;
    this.upperLimit = upper;
    this.lowerLimitEnabled = this.upperLimitEnabled = true;
  }

  update() {
    const bodyA = this.bodyA,
          bodyB = this.bodyB,
          pivotA = this.pivotA,
          pivotB = this.pivotB,
          eqs = this.equations,
          x = eqs[0],
          y = eqs[1],
          upperLimit = this.upperLimit,
          lowerLimit = this.lowerLimit,
          upperLimitEquation = this.upperLimitEquation,
          lowerLimitEquation = this.lowerLimitEquation;
    const relAngle = this.angle = bodyB.angle - bodyA.angle;
    upperLimitEquation.angle = upperLimit;
    upperLimitEquation.enabled = this.upperLimitEnabled && relAngle > upperLimit;
    lowerLimitEquation.angle = lowerLimit;
    lowerLimitEquation.enabled = this.lowerLimitEnabled && relAngle < lowerLimit;
    /*
     The constraint violation is
         g = xj + rj - xi - ri
     ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:
         gdot = vj + wj x rj - vi - wi x ri
     We split this into x and y directions. (let x and y be unit vectors along the respective axes)
         gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                = G*W
     ...and similar for y. We have then identified the jacobian entries for x and y directions:
         Gx = [ x   (rj x x)   -x   -(ri x x)]
        Gy = [ y   (rj x y)   -y   -(ri x y)]
     So for example, in the X direction we would get in 2 dimensions
         G = [ [1   0   (rj x [1,0])   -1   0   -(ri x [1,0])]
            [0   1   (rj x [0,1])    0  -1   -(ri x [0,1])]
    */

    rotate(worldPivotA, pivotA, bodyA.angle);
    rotate(worldPivotB, pivotB, bodyB.angle); // @todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

    const xG = x.G;
    xG[2] = -crossLength(worldPivotA, xAxis);
    xG[5] = crossLength(worldPivotB, xAxis);
    const yG = y.G;
    yG[2] = -crossLength(worldPivotA, yAxis);
    yG[5] = crossLength(worldPivotB, yAxis);
  }
  /**
   * Enable the rotational motor
   * @deprecated Use motorEnabled instead
   */


  enableMotor() {
    console.warn('revolute.enableMotor() is deprecated, do revolute.motorEnabled = true; instead.');
    this.motorEnabled = true;
  }
  /**
   * Disable the rotational motor
   * @deprecated Use motorEnabled instead
   */


  disableMotor() {
    console.warn('revolute.disableMotor() is deprecated, do revolute.motorEnabled = false; instead.');
    this.motorEnabled = false;
  }
  /**
   * Check if the motor is enabled.
   * @deprecated Use motorEnabled instead
   * @returns
   */


  motorIsEnabled() {
    console.warn('revolute.motorIsEnabled() is deprecated, use revolute.motorEnabled instead.');
    return this.motorEnabled;
  }
  /**
   * Set the speed of the rotational constraint motor
   * @deprecated Use .motorSpeed instead
   * @param speed
   */


  setMotorSpeed(speed) {
    console.warn('revolute.setMotorSpeed(speed) is deprecated, do revolute.motorSpeed = speed; instead.');
    this.motorSpeed = speed;
  }
  /**
   * Get the speed of the rotational constraint motor
   * @deprecated Use .motorSpeed instead
   * @returns
   */


  getMotorSpeed() {
    console.warn('revolute.getMotorSpeed() is deprecated, use revolute.motorSpeed instead.');
    return this.motorSpeed;
  }

}
const worldPivotA = create(),
      worldPivotB = create(),
      xAxis = fromValues(1, 0),
      yAxis = fromValues(0, 1),
      g = create();

/**
 * Defines a physics material.
 *
 * To be used with {@link ContactMaterial}.
 *
 * @example
 *     // Create a wooden box
 *     var woodMaterial = new Material();
 *     var boxShape = new Box({
 *         material: woodMaterial
 *     });
 *     body.addShape(boxShape);
 */
class Material {
  /**
   * The material identifier. Read only.
   */

  /**
   * Id counter for materials
   */
  constructor() {
    this.id = Material.idCounter++;
  }

}
Material.idCounter = 0;

/**
 * Defines what happens when two materials meet, such as what friction coefficient to use.
 * You can also set other things such as restitution, surface velocity and constraint parameters.
 *
 * Also see {@link Material}
 *
 * @example
 *     var ice = new Material();
 *     var wood = new Material();
 *     var iceWoodContactMaterial = new ContactMaterial(ice, wood, {
 *         friction: 0.2,
 *         restitution: 0.3
 *     });
 *     world.addContactMaterial(iceWoodContactMaterial);
 */
class ContactMaterial {
  /**
   * The contact material identifier. Read only.
   */

  /**
   * First material participating in the contact material
   */

  /**
   * Second material participating in the contact material
   */

  /**
   * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
   * @default 0.3
   */

  /**
   * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
   * @default 0
   */

  /**
   * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force.
   * Default value is {@link Equation.DEFAULT_STIFFNESS}
   */

  /**
   * Relaxation of the resulting ContactEquation that this ContactMaterial will generate.
   * Default value is {@link Equation.DEFAULT_RELAXATION}
   */

  /**
   * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness.
   * Default value is {@link Equation.DEFAULT_STIFFNESS}
   */

  /**
   * Relaxation of the resulting friction force. The default value should be good for most simulations.
   * Default value is {@link Equation.DEFAULT_RELAXATION}
   */

  /**
   * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
   */

  /**
   * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
   */

  /**
   * Id counter for created contact materials.
   */
  constructor(materialA, materialB, options) {
    if (options === void 0) {
      options = {};
    }

    if (!(materialA instanceof Material) || !(materialB instanceof Material)) {
      throw new Error('First two arguments must be Material instances.');
    }

    this.id = ContactMaterial.idCounter++;
    this.materialA = materialA;
    this.materialB = materialB;
    this.friction = options.friction ?? 0.3;
    this.restitution = options.restitution ?? 0;
    this.stiffness = options.stiffness ?? Equation.DEFAULT_STIFFNESS;
    this.relaxation = options.relaxation ?? Equation.DEFAULT_RELAXATION;
    this.frictionStiffness = options.frictionStiffness ?? Equation.DEFAULT_STIFFNESS;
    this.frictionRelaxation = options.frictionRelaxation ?? Equation.DEFAULT_RELAXATION;
    this.surfaceVelocity = options.surfaceVelocity ?? 0;
    this.contactSkinSize = 0.005;
  }

}
ContactMaterial.idCounter = 0;

/**
 * Base class for {@link LinearSpring} and {@link RotationalSpring}. Not supposed to be used directly.
 */
class Spring {
  /**
   * Stiffness of the spring.
   */

  /**
   * Damping of the spring.
   */

  /**
   * First connected body.
   */

  /**
   * Second connected body.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    this.stiffness = options.stiffness ?? 100;
    this.damping = options.damping ?? 1;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
  }
  /**
   * Apply the spring force to the connected bodies. Called automatically by the World.
   */


}

/**
 * A spring, connecting two bodies.
 *
 * The Spring explicitly adds force and angularForce to the bodies.
 *
 * @example
 *     var spring = new LinearSpring(bodyA, bodyB, {
 *         stiffness: 100,
 *         damping: 1,
 *         localAnchorA: [0,0], // center of bodyA
 *         localAnchorB: [0,0] // center of bodyB
 *     });
 *     world.addSpring(spring);
 */
class LinearSpring extends Spring {
  /**
   * Anchor for bodyA in local bodyA coordinates.
   */

  /**
   * Anchor for bodyB in local bodyB coordinates.
   */

  /**
   * Rest length of the spring. Can be set dynamically.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, options);
    this.localAnchorA = create();
    this.localAnchorB = create();

    if (options.localAnchorA) {
      copy(this.localAnchorA, options.localAnchorA);
    }

    if (options.localAnchorB) {
      copy(this.localAnchorB, options.localAnchorB);
    }

    if (options.worldAnchorA) {
      this.setWorldAnchorA(options.worldAnchorA);
    }

    if (options.worldAnchorB) {
      this.setWorldAnchorB(options.worldAnchorB);
    }

    const worldAnchorA = create();
    const worldAnchorB = create();
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);
    const worldDistance = distance(worldAnchorA, worldAnchorB);
    this.restLength = options.restLength ?? worldDistance;
  }
  /**
   * Set the anchor point on body A, using world coordinates.
   * @param worldAnchorA
   */


  setWorldAnchorA(worldAnchorA) {
    this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
  }
  /**
   * Set the anchor point on body B, using world coordinates.
   * @param worldAnchorB
   */


  setWorldAnchorB(worldAnchorB) {
    this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
  }
  /**
   * Get the anchor point on body A, in world coordinates.
   * @param result
   */


  getWorldAnchorA(result) {
    this.bodyA.toWorldFrame(result, this.localAnchorA);
  }
  /**
   * Set the anchor point on body B, using world coordinates.
   * @param result
   */


  getWorldAnchorB(result) {
    this.bodyB.toWorldFrame(result, this.localAnchorB);
  }
  /**
   * Apply the spring force to the connected bodies
   */


  applyForce() {
    const k = this.stiffness,
          d = this.damping,
          l = this.restLength,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          r = applyForce_r,
          r_unit = applyForce_r_unit,
          u = applyForce_u,
          f = applyForce_f,
          tmp = applyForce_tmp;
    const worldAnchorA = applyForce_worldAnchorA,
          worldAnchorB = applyForce_worldAnchorB,
          ri = applyForce_ri,
          rj = applyForce_rj; // Get world anchors

    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB); // Get offset points

    subtract(ri, worldAnchorA, bodyA.position);
    subtract(rj, worldAnchorB, bodyB.position); // Compute distance vector between world anchor points

    subtract(r, worldAnchorB, worldAnchorA);
    const rlen = length(r);
    normalize(r_unit, r); // Compute relative velocity of the anchor points, u

    subtract(u, bodyB.velocity, bodyA.velocity);
    crossZV(tmp, bodyB.angularVelocity, rj);
    add(u, u, tmp);
    crossZV(tmp, bodyA.angularVelocity, ri);
    subtract(u, u, tmp); // F = - k * ( x - L ) - D * ( u )

    scale(f, r_unit, -k * (rlen - l) - d * dot(u, r_unit)); // Add forces to bodies

    subtract(bodyA.force, bodyA.force, f);
    add(bodyB.force, bodyB.force, f); // Angular force

    const ri_x_f = crossLength(ri, f);
    const rj_x_f = crossLength(rj, f);
    bodyA.angularForce -= ri_x_f;
    bodyB.angularForce += rj_x_f;
  }

}
const applyForce_r = create();
const applyForce_r_unit = create();
const applyForce_u = create();
const applyForce_f = create();
const applyForce_worldAnchorA = create();
const applyForce_worldAnchorB = create();
const applyForce_ri = create();
const applyForce_rj = create();
const applyForce_tmp = create();

/**
 * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
 *
 * The spring can be combined with a {@link RevoluteConstraint} to make, for example, a mouse trap.
 *
 * @example
 *     var spring = new RotationalSpring(bodyA, bodyB, {
 *         stiffness: 100,
 *         damping: 1
 *     });
 *     world.addSpring(spring);
 */
class RotationalSpring extends Spring {
  /**
   * Rest angle of the spring.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }

    super(bodyA, bodyB, options);
    this.restAngle = options.restAngle ?? bodyB.angle - bodyA.angle;
  }
  /**
   * Apply the spring force to the connected bodies.
   */


  applyForce() {
    const k = this.stiffness,
          d = this.damping,
          l = this.restAngle,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          x = bodyB.angle - bodyA.angle,
          u = bodyB.angularVelocity - bodyA.angularVelocity;
    const torque = -k * (x - l) - d * u;
    bodyA.angularForce -= torque;
    bodyB.angularForce += torque;
  }

}

/**
 * WheelConstraint
 */
class WheelConstraint extends Constraint {
  constructor(vehicle, options) {
    if (options === void 0) {
      options = {};
    }

    super(vehicle.chassisBody, vehicle.groundBody);
    this.vehicle = vehicle;
    this.forwardEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);
    this.sideEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);
    this.steerValue = 0;
    this.engineForce = 0;
    this.setSideFriction(options.sideFriction ?? 5);
    this.localForwardVector = fromValues(0, 1);

    if (options.localForwardVector) {
      copy(this.localForwardVector, options.localForwardVector);
    }

    this.localPosition = create();

    if (options.localPosition) {
      copy(this.localPosition, options.localPosition);
    }

    this.equations.push(this.forwardEquation, this.sideEquation);
    this.setBrakeForce(0);
  }

  setBrakeForce(force) {
    this.forwardEquation.setSlipForce(force);
  }

  setSideFriction(force) {
    this.sideEquation.setSlipForce(force);
  }

  getSpeed() {
    const body = this.vehicle.chassisBody;
    body.vectorToWorldFrame(relativePoint, this.localForwardVector);
    body.getVelocityAtPoint(worldVelocity, relativePoint);
    return dot(worldVelocity, relativePoint);
  }

  update() {
    const body = this.vehicle.chassisBody;
    const forwardEquation = this.forwardEquation;
    const sideEquation = this.sideEquation;
    const steerValue = this.steerValue; // Directional

    body.vectorToWorldFrame(forwardEquation.t, this.localForwardVector);
    rotate(sideEquation.t, this.localForwardVector, Math.PI / 2);
    body.vectorToWorldFrame(sideEquation.t, sideEquation.t);
    rotate(forwardEquation.t, forwardEquation.t, steerValue);
    rotate(sideEquation.t, sideEquation.t, steerValue); // Attachment point

    body.toWorldFrame(forwardEquation.contactPointB, this.localPosition);
    copy(sideEquation.contactPointB, forwardEquation.contactPointB);
    body.vectorToWorldFrame(forwardEquation.contactPointA, this.localPosition);
    copy(sideEquation.contactPointA, forwardEquation.contactPointA); // Add engine force

    normalize(tmpVec, forwardEquation.t);
    scale(tmpVec, tmpVec, this.engineForce);
    this.vehicle.chassisBody.applyForce(tmpVec, forwardEquation.contactPointA);
  }

}
/**
 * TopDownVehicle
 *
 * @deprecated This class will be moved out of the core library in future versions.
 *
 * @example
 *
 *     // Create a dynamic body for the chassis
 *     var chassisBody = new Body({
 *         mass: 1
 *     });
 *     var boxShape = new Box({ width: 0.5, height: 1 });
 *     chassisBody.addShape(boxShape);
 *     world.addBody(chassisBody);
 *
 *     // Create the vehicle
 *     var vehicle = new TopDownVehicle(chassisBody);
 *
 *     // Add one front wheel and one back wheel - we don't actually need four :)
 *     var frontWheel = vehicle.addWheel({
 *         localPosition: [0, 0.5] // front
 *     });
 *     frontWheel.setSideFriction(4);
 *
 *     // Back wheel
 *     var backWheel = vehicle.addWheel({
 *         localPosition: [0, -0.5] // back
 *     });
 *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
 *     vehicle.addToWorld(world);
 *
 *     // Steer value zero means straight forward. Positive is left and negative right.
 *     frontWheel.steerValue = Math.PI / 16;
 *
 *     // Engine force forward
 *     backWheel.engineForce = 10;
 *     backWheel.setBrakeForce(0);
 */

class TopDownVehicle {
  constructor(chassisBody) {
    this.chassisBody = chassisBody;
    this.wheels = []; // A dummy body to constrain the chassis to

    this.groundBody = new Body({
      mass: 0
    });
    this.world = null;
  }

  addToWorld(world) {
    this.world = world;
    world.addBody(this.groundBody);

    for (let i = 0; i < this.wheels.length; i++) {
      const wheel = this.wheels[i];
      world.addConstraint(wheel);
    }
  }

  removeFromWorld() {
    if (this.world === null) {
      return;
    }

    this.world.removeBody(this.groundBody);

    for (let i = 0; i < this.wheels.length; i++) {
      const wheel = this.wheels[i];
      this.world.removeConstraint(wheel);
    }

    this.world = null;
  }

  addWheel(wheelOptions) {
    const wheel = new WheelConstraint(this, wheelOptions);
    this.wheels.push(wheel);
    return wheel;
  }

}
const worldVelocity = create();
const relativePoint = create();
const tmpVec = create();

/**
 * Options for creating a {@link Capsule}
 */

/**
 * Capsule shape.
 *
 * @example
 *     var body = new Body({ mass: 1 });
 *     var capsuleShape = new Capsule({
 *         length: 1,
 *         radius: 2
 *     });
 *     body.addShape(capsuleShape);
 */
class Capsule extends Shape {
  /**
   * The distance between the end points, extends along the X axis.
   */

  /**
   * Radius of the capsule.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: Shape.CAPSULE,
      length: options.length ?? 1,
      radius: options.radius ?? 1
    };
    super(params);
    this.length = params.length;
    this.radius = params.radius;
    this.updateBoundingRadius();
    this.updateArea();
  }
  /**
   * Compute the mass moment of inertia of the Capsule.
   */


  computeMomentOfInertia() {
    // http://www.efunda.com/math/areas/rectangle.cfm
    function boxI(w, h) {
      return w * h * (Math.pow(w, 2) + Math.pow(h, 2)) / 12;
    }

    function semiA(r) {
      return Math.PI * Math.pow(r, 2) / 2;
    } // http://www.efunda.com/math/areas/CircleHalf.cfm


    function semiI(r) {
      return (Math.PI / 4 - 8 / (9 * Math.PI)) * Math.pow(r, 4);
    }

    function semiC(r) {
      return 4 * r / (3 * Math.PI);
    } // https://en.wikipedia.org/wiki/Second_moment_of_area#Parallel_axis_theorem


    function capsuleA(l, r) {
      return l * 2 * r + Math.PI * Math.pow(r, 2);
    }

    function capsuleI(l, r) {
      const d = l / 2 + semiC(r);
      return boxI(l, 2 * r) + 2 * (semiI(r) + semiA(r) * Math.pow(d, 2));
    }

    const r = this.radius,
          l = this.length,
          area = capsuleA(l, r);
    return area > 0 ? capsuleI(l, r) / area : 0;
  }

  updateArea() {
    this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
  }

  updateBoundingRadius() {
    this.boundingRadius = this.radius + this.length / 2;
  }

  computeAABB(out, position, angle) {
    const radius = this.radius; // Compute center position of one of the the circles, world oriented, but with local offset

    set(r, this.length / 2, 0);

    if (angle !== 0) {
      rotate(r, r, angle);
    } // Get bounds


    set(out.upperBound, Math.max(r[0] + radius, -r[0] + radius), Math.max(r[1] + radius, -r[1] + radius));
    set(out.lowerBound, Math.min(r[0] - radius, -r[0] - radius), Math.min(r[1] - radius, -r[1] - radius)); // Add offset

    add(out.lowerBound, out.lowerBound, position);
    add(out.upperBound, out.upperBound, position);
  }

  raycast(result, ray, position, angle) {
    const from = ray.from;
    const to = ray.to;
    const hitPointWorld = intersectCapsule_hitPointWorld;
    const normal = intersectCapsule_normal;
    const l0 = intersectCapsule_l0;
    const l1 = intersectCapsule_l1; // The sides

    const halfLen = this.length / 2;

    for (let i = 0; i < 2; i++) {
      // get start and end of the line
      const y = this.radius * (i * 2 - 1);
      set(l0, -halfLen, y);
      set(l1, halfLen, y);
      toGlobalFrame(l0, l0, position, angle);
      toGlobalFrame(l1, l1, position, angle);
      const delta = getLineSegmentsIntersectionFraction(from, to, l0, l1);

      if (delta >= 0) {
        rotate(normal, intersectCapsule_unit_y, angle);
        scale(normal, normal, i * 2 - 1);
        ray.reportIntersection(result, delta, normal, -1);

        if (result.shouldStop(ray)) {
          return;
        }
      }
    } // Circles


    const diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2);

    for (let i = 0; i < 2; i++) {
      set(l0, halfLen * (i * 2 - 1), 0);
      toGlobalFrame(l0, l0, position, angle);
      const a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
      const b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]));
      const c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2);
      const delta = Math.pow(b, 2) - 4 * a * c;

      if (delta < 0) {
        // No intersection
        continue;
      } else if (delta === 0) {
        // single intersection point
        lerp(hitPointWorld, from, to, delta);

        if (squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
          subtract(normal, hitPointWorld, l0);
          normalize(normal, normal);
          ray.reportIntersection(result, delta, normal, -1);

          if (result.shouldStop(ray)) {
            return;
          }
        }
      } else {
        const sqrtDelta = Math.sqrt(delta);
        const inv2a = 1 / (2 * a);
        const d1 = (-b - sqrtDelta) * inv2a;
        const d2 = (-b + sqrtDelta) * inv2a;

        if (d1 >= 0 && d1 <= 1) {
          lerp(hitPointWorld, from, to, d1);

          if (squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
            subtract(normal, hitPointWorld, l0);
            normalize(normal, normal);
            ray.reportIntersection(result, d1, normal, -1);

            if (result.shouldStop(ray)) {
              return;
            }
          }
        }

        if (d2 >= 0 && d2 <= 1) {
          lerp(hitPointWorld, from, to, d2);

          if (squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
            subtract(normal, hitPointWorld, l0);
            normalize(normal, normal);
            ray.reportIntersection(result, d2, normal, -1);

            if (result.shouldStop(ray)) {
              return;
            }
          }
        }
      }
    }
  }

  pointTest(localPoint) {
    const radius = this.radius;
    const halfLength = this.length * 0.5;

    if (Math.abs(localPoint[0]) <= halfLength && Math.abs(localPoint[1]) <= radius) {
      return true;
    }

    if (Math.pow(localPoint[0] - halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
      return true;
    }

    if (Math.pow(localPoint[0] + halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
      return true;
    }

    return false;
  }

}
const r = create();
const intersectCapsule_hitPointWorld = create();
const intersectCapsule_normal = create();
const intersectCapsule_l0 = create();
const intersectCapsule_l1 = create();
const intersectCapsule_unit_y = fromValues(0, 1);

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 *
 * @example
 *     // Generate some height data (y-values).
 *     var heights = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         heights.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var shape = new Heightfield({
 *         heights: heights,
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
 *     var body = new Body();
 *     body.addShape(shape);
 *     world.addBody(body);
 *
 * @todo Should use a scale property with X and Y direction instead of just elementWidth
 */
class Heightfield extends Shape {
  /**
   * An array of numbers, or height values, that are spread out along the x axis.
   */

  /**
   * Max value of the heights
   */

  /**
   * Min value of the heights
   */

  /**
   * The width of each element
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: Shape.HEIGHTFIELD,
      heights: options.heights ? [...options.heights] : [],
      elementWidth: options.elementWidth ?? 0.1
    };
    super(params);
    this.heights = params.heights;
    this.maxValue = params.maxValue;
    this.minValue = params.minValue;
    this.elementWidth = params.elementWidth;

    if (params.maxValue === undefined || params.minValue === undefined) {
      this.updateMaxMinValues();
    }

    this.updateBoundingRadius();
    this.updateArea();
  }

  updateMaxMinValues() {
    const data = this.heights;
    let maxValue = data[0];
    let minValue = data[0];

    for (let i = 0; i !== data.length; i++) {
      const v = data[i];

      if (v > maxValue) {
        maxValue = v;
      }

      if (v < minValue) {
        minValue = v;
      }
    }

    this.maxValue = maxValue;
    this.minValue = minValue;
  }

  computeMomentOfInertia() {
    return Number.MAX_VALUE;
  }

  updateBoundingRadius() {
    this.boundingRadius = Number.MAX_VALUE;
  }

  updateArea() {
    const data = this.heights;
    let area = 0;

    for (let i = 0; i < data.length - 1; i++) {
      area += (data[i] + data[i + 1]) / 2 * this.elementWidth;
    }

    this.area = area;
  }

  computeAABB(out, position, angle) {
    set(points$1[0], 0, this.maxValue);
    set(points$1[1], this.elementWidth * this.heights.length, this.maxValue);
    set(points$1[2], this.elementWidth * this.heights.length, this.minValue);
    set(points$1[3], 0, this.minValue);
    out.setFromPoints(points$1, position, angle);
  }
  /**
   * Get a line segment in the heightfield
   * @param start Where to store the resulting start point
   * @param end Where to store the resulting end point
   * @param i
   */


  getLineSegment(start, end, i) {
    const data = this.heights;
    const width = this.elementWidth;
    set(start, i * width, data[i]);
    set(end, (i + 1) * width, data[i + 1]);
  }

  getSegmentIndex(position) {
    return Math.floor(position[0] / this.elementWidth);
  }

  getClampedSegmentIndex(position) {
    let i = this.getSegmentIndex(position);
    i = Math.min(this.heights.length, Math.max(i, 0)); // clamp

    return i;
  }

  raycast(result, ray, position, angle) {
    const from = ray.from;
    const to = ray.to;
    const worldNormal = intersectHeightfield_worldNormal;
    const l0 = intersectHeightfield_l0;
    const l1 = intersectHeightfield_l1;
    const localFrom = intersectHeightfield_localFrom;
    const localTo = intersectHeightfield_localTo; // get local ray start and end

    toLocalFrame(localFrom, from, position, angle);
    toLocalFrame(localTo, to, position, angle); // Get the segment range

    this.getClampedSegmentIndex(localFrom);
    this.getClampedSegmentIndex(localTo);


    for (let i = 0; i < this.heights.length - 1; i++) {
      this.getLineSegment(l0, l1, i);
      const t = getLineSegmentsIntersectionFraction(localFrom, localTo, l0, l1);

      if (t >= 0) {
        subtract(worldNormal, l1, l0);
        rotate(worldNormal, worldNormal, angle + Math.PI / 2);
        normalize(worldNormal, worldNormal);
        ray.reportIntersection(result, t, worldNormal, -1);

        if (result.shouldStop(ray)) {
          return;
        }
      }
    }
  }

}
const points$1 = [create(), create(), create(), create()];
const intersectHeightfield_worldNormal = create();
const intersectHeightfield_l0 = create();
const intersectHeightfield_l1 = create();
const intersectHeightfield_localFrom = create();
const intersectHeightfield_localTo = create();

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 *
 * @example
 *     var body = new Body();
 *     var lineShape = new Line({
 *         length: 1
 *     });
 *     body.addShape(lineShape);
 */
class Line extends Shape {
  /**
   * Length of the line
   * @default 1
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    const params = { ...options,
      type: Shape.LINE,
      length: options.length ?? 1
    };
    super(params);
    this.length = params.length;
    this.updateBoundingRadius();
    this.updateArea();
  }

  computeMomentOfInertia() {
    return Math.pow(this.length, 2) / 12;
  }

  updateBoundingRadius() {
    this.boundingRadius = this.length / 2;
  }

  computeAABB(out, position, angle) {
    const l2 = this.length / 2;
    set(points[0], -l2, 0);
    set(points[1], l2, 0);
    out.setFromPoints(points, position, angle, 0);
  }

  raycast(result, ray, position, angle) {
    const from = ray.from;
    const to = ray.to;
    const l0 = raycast_l0;
    const l1 = raycast_l1; // get start and end of the line

    const halfLen = this.length / 2;
    set(l0, -halfLen, 0);
    set(l1, halfLen, 0);
    toGlobalFrame(l0, l0, position, angle);
    toGlobalFrame(l1, l1, position, angle);
    const fraction = getLineSegmentsIntersectionFraction(from, to, l0, l1);

    if (fraction >= 0) {
      const normal = raycast_normal;
      rotate(normal, raycast_unit_y, angle); // todo: this should depend on which side the ray comes from

      ray.reportIntersection(result, fraction, normal, -1);
    }
  }

}
const points = [create(), create()];
const raycast_normal = create();
const raycast_l0 = create();
const raycast_l1 = create();
const raycast_unit_y = fromValues(0, 1);

class Particle extends Shape {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    super({ ...options,
      type: Shape.PARTICLE
    });
    this.updateBoundingRadius();
    this.updateArea();
  }

  computeMomentOfInertia() {
    return 0; // Can't rotate a particle
  }

  updateBoundingRadius() {
    this.boundingRadius = 0;
  }

  computeAABB(out, position) {
    copy(out.lowerBound, position);
    copy(out.upperBound, position);
  }

}

/**
 * Plane shape class. The plane is facing in the Y direction.
 *
 * @example
 *     var body = new Body();
 *     var shape = new Plane();
 *     body.addShape(shape);
 */

class Plane extends Shape {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    super({ ...options,
      type: Shape.PLANE
    });
    this.updateBoundingRadius();
    this.updateArea();
  }

  computeMomentOfInertia() {
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
  }

  updateBoundingRadius() {
    this.boundingRadius = Number.MAX_VALUE;
  }

  updateArea() {
    this.area = Number.MAX_VALUE;
  }

  computeAABB(out, position, angle) {
    const a = angle % (2 * Math.PI);
    const set$1 = set;
    const max = 1e7;
    const lowerBound = out.lowerBound;
    const upperBound = out.upperBound; // Set max bounds

    set$1(lowerBound, -max, -max);
    set$1(upperBound, max, max);

    if (a === 0) {
      // y goes from -inf to 0
      upperBound[1] = position[1];
    } else if (a === Math.PI / 2) {
      // x goes from 0 to inf
      lowerBound[0] = position[0];
    } else if (a === Math.PI) {
      // y goes from 0 to inf
      lowerBound[1] = position[1];
    } else if (a === 3 * Math.PI / 2) {
      // x goes from -inf to 0
      upperBound[0] = position[0];
    }
  }

  raycast(result, ray, position, angle) {
    const from = ray.from;
    const to = ray.to;
    const direction = ray.direction;
    const planePointToFrom = intersectPlane_planePointToFrom;
    const normal = intersectPlane_normal;
    const len = intersectPlane_len; // Get plane normal

    set(normal, 0, 1);
    rotate(normal, normal, angle);
    subtract(len, from, position);
    const planeToFrom = dot(len, normal);
    subtract(len, to, position);
    const planeToTo = dot(len, normal);

    if (planeToFrom * planeToTo > 0) {
      // "from" and "to" are on the same side of the plane... bail out
      return;
    }

    if (squaredDistance(from, to) < planeToFrom * planeToFrom) {
      return;
    }

    const n_dot_dir = dot(normal, direction);
    subtract(planePointToFrom, from, position);
    const t = -dot(normal, planePointToFrom) / n_dot_dir / ray.length;
    ray.reportIntersection(result, t, normal, -1);
  }

  pointTest(localPoint) {
    return localPoint[1] <= 0;
  }

}
const intersectPlane_planePointToFrom = create();
const intersectPlane_normal = create();
const intersectPlane_len = create();

/**
 * Base class for constraint solvers.
 */
class Solver {
  /**
   * Gauss-Seidel solver.
   */

  /**
   * The type of solver.
   */

  /**
   * Current equations in the solver.
   */

  /**
   * Function that is used to sort all equations before each solve.
   */
  constructor(options, type) {
    if (options === void 0) {
      options = {};
    }

    this.type = type;
    this.equations = [];
    this.equationSortFunction = options.equationSortFunction;
  }
  /**
   * Method to be implemented in each subclass
   * @param dt
   * @param world
   */


  /**
   * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
   */
  sortEquations() {
    if (this.equationSortFunction) {
      this.equations.sort(this.equationSortFunction);
    }
  }
  /**
   * Add an equation to be solved.
   * @param eq
   */


  addEquation(eq) {
    if (eq.enabled) {
      this.equations.push(eq);
    }
  }
  /**
   * Add equations. Same as .addEquation, but this time the argument is an array of Equations
   * @param eqs
   */


  addEquations(eqs) {
    for (let i = 0, N = eqs.length; i !== N; i++) {
      const eq = eqs[i];

      if (eq.enabled) {
        this.equations.push(eq);
      }
    }
  }
  /**
   * Removes an equation
   * @param eq
   */


  removeEquation(eq) {
    const i = this.equations.indexOf(eq);

    if (i !== -1) {
      this.equations.splice(i, 1);
    }
  }
  /**
   * Removes all currently added equations
   */


  removeAllEquations() {
    this.equations.length = 0;
  }

}

/**
 * Iterative Gauss-Seidel constraint equation solver.
 */
class GSSolver extends Solver {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    super(options, Solver.GS);
    this.type = Solver.GS;
    this.iterations = options.iterations ?? 10;
    this.tolerance = options.tolerance ?? 1e-7;
    this.frictionIterations = options.frictionIterations ?? 0;
    this.usedIterations = 0;
  }

  solve(h, world) {
    this.sortEquations();
    let iter = 0;
    const maxIter = this.iterations;
    const maxFrictionIter = this.frictionIterations;
    const equations = this.equations;
    const Neq = equations.length;
    const tolSquared = Math.pow(this.tolerance * Neq, 2);
    const bodies = world.bodies;
    const Nbodies = bodies.length;
    this.usedIterations = 0;

    if (Neq) {
      for (let i = 0; i !== Nbodies; i++) {
        const b = bodies[i]; // Update solve mass

        b.updateSolveMassProperties();
      }
    }

    for (let i = 0; i !== Neq; i++) {
      const c = equations[i];
      c.lambda = 0;

      if (c.timeStep !== h || c.needsUpdate) {
        c.timeStep = h;
        c.update();
      }

      c.B = c.computeB(c.a, c.b, h);
      c.invC = c.computeInvC(c.epsilon);
      c.maxForceDt = c.maxForce * h;
      c.minForceDt = c.minForce * h;
    }

    let c, deltalambdaTot, i, j;

    if (Neq !== 0) {
      for (i = 0; i !== Nbodies; i++) {
        const b = bodies[i]; // Reset vlambda

        b.resetConstraintVelocity();
      }

      if (maxFrictionIter) {
        // Iterate over contact equations to get normal forces
        for (iter = 0; iter !== maxFrictionIter; iter++) {
          // Accumulate the total error for each iteration.
          deltalambdaTot = 0.0;

          for (j = 0; j !== Neq; j++) {
            c = equations[j];
            const deltalambda = iterateEquation(c);
            deltalambdaTot += Math.abs(deltalambda);
          }

          this.usedIterations++; // If the total error is small enough - stop iterate

          if (deltalambdaTot * deltalambdaTot <= tolSquared) {
            break;
          }
        }

        updateMultipliers(equations, 1 / h); // Set computed friction force

        for (j = 0; j !== Neq; j++) {
          const eq = equations[j];

          if (eq instanceof FrictionEquation) {
            let f = 0.0;

            for (let k = 0; k !== eq.contactEquations.length; k++) {
              f += eq.contactEquations[k].multiplier;
            }

            f *= eq.frictionCoefficient / eq.contactEquations.length;
            eq.maxForce = f;
            eq.minForce = -f;
            eq.maxForceDt = f * h;
            eq.minForceDt = -f * h;
          }
        }
      } // Iterate over all equations


      for (iter = 0; iter !== maxIter; iter++) {
        // Accumulate the total error for each iteration.
        deltalambdaTot = 0.0;

        for (j = 0; j !== Neq; j++) {
          c = equations[j];
          const deltalambda = iterateEquation(c);
          deltalambdaTot += Math.abs(deltalambda);
        }

        this.usedIterations++; // If the total error is small enough - stop iterate

        if (deltalambdaTot * deltalambdaTot < tolSquared) {
          break;
        }
      } // Add result to velocity


      for (i = 0; i !== Nbodies; i++) {
        bodies[i].addConstraintVelocity();
      }

      updateMultipliers(equations, 1 / h);
    }
  }

} // Sets the .multiplier property of each equation

function updateMultipliers(equations, invDt) {
  let l = equations.length;

  while (l--) {
    const eq = equations[l];
    eq.multiplier = eq.lambda * invDt;
  }
}

function iterateEquation(eq) {
  // Compute iteration
  const B = eq.B,
        eps = eq.epsilon,
        invC = eq.invC,
        lambdaj = eq.lambda,
        GWlambda = eq.computeGWlambda(),
        maxForce_dt = eq.maxForceDt,
        minForce_dt = eq.minForceDt;
  let deltalambda = invC * (B - GWlambda - eps * lambdaj); // Clamp if we are not within the min/max interval

  const lambdaj_plus_deltalambda = lambdaj + deltalambda;

  if (lambdaj_plus_deltalambda < minForce_dt) {
    deltalambda = minForce_dt - lambdaj;
  } else if (lambdaj_plus_deltalambda > maxForce_dt) {
    deltalambda = maxForce_dt - lambdaj;
  }

  eq.lambda += deltalambda;
  eq.addToWlambda(deltalambda);
  return deltalambda;
}

/**
 * Overlap data container for the OverlapKeeper
 */
class OverlapKeeperRecord {
  constructor(bodyA, shapeA, bodyB, shapeB) {
    this.bodyA = bodyA;
    this.shapeA = shapeA;
    this.bodyB = bodyB;
    this.shapeB = shapeB;
  }
  /**
   * Set the data for the record
   * @param bodyA
   * @param shapeA
   * @param bodyB
   * @param shapeB
   */


  set(bodyA, shapeA, bodyB, shapeB) {
    this.bodyA = bodyA;
    this.shapeA = shapeA;
    this.bodyB = bodyB;
    this.shapeB = shapeB;
  }

}

class OverlapKeeperRecordPool extends Pool {
  create() {
    return new OverlapKeeperRecord(tmpBody, tmpShape, tmpBody, tmpShape);
  }

  destroy(record) {
    record.bodyA = record.bodyB = tmpBody;
    record.shapeA = record.shapeB = tmpShape;
    return this;
  }

}
const tmpShape = new Circle({
  radius: 1
});
const tmpBody = new Body();

class OverlapKeeper {
  constructor() {
    this.overlappingShapesLastState = new TupleDictionary();
    this.overlappingShapesCurrentState = new TupleDictionary();
    this.recordPool = new OverlapKeeperRecordPool({
      size: 16
    });
    this.tmpDict = new TupleDictionary();
    this.tmpArray1 = [];
  }
  /**
   * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
   */


  tick() {
    const last = this.overlappingShapesLastState;
    const current = this.overlappingShapesCurrentState; // Save old objects into pool

    let l = last.keys.length;

    while (l--) {
      const key = last.keys[l];
      const lastObject = last.getByKey(key);

      if (lastObject) {
        // The record is only used in the "last" dict, and will be removed. We might as well pool it.
        this.recordPool.release(lastObject);
      }
    } // Transfer from new object to old


    last.copy(current); // Clear current object

    current.reset();
  }
  /**
   * Checks if two bodies are currently overlapping.
   * @param bodyA
   * @param bodyB
   * @return if two bodies are currently overlapping
   */


  bodiesAreOverlapping(bodyA, bodyB) {
    const current = this.overlappingShapesCurrentState;
    let l = current.keys.length;

    while (l--) {
      const key = current.keys[l];
      const data = current.data[key];

      if (data.bodyA === bodyA && data.bodyB === bodyB || data.bodyA === bodyB && data.bodyB === bodyA) {
        return true;
      }
    }

    return false;
  }

  setOverlapping(bodyA, shapeA, bodyB, shapeB) {
    const current = this.overlappingShapesCurrentState; // Store current contact state

    if (!current.get(shapeA.id, shapeB.id)) {
      const data = this.recordPool.get();
      data.set(bodyA, shapeA, bodyB, shapeB);
      current.set(shapeA.id, shapeB.id, data);
    }
  }

  getNewOverlaps(result) {
    return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result);
  }

  getEndOverlaps(result) {
    return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result);
  }

  getDiff(dictA, dictB, result) {
    if (result === void 0) {
      result = [];
    }

    const last = dictA;
    const current = dictB;
    result.length = 0;
    let l = current.keys.length;

    while (l--) {
      const key = current.keys[l];
      const data = current.data[key];

      if (!data) {
        throw new Error('Key ' + key + ' had no data!');
      }

      const lastData = last.data[key];

      if (!lastData) {
        // Not overlapping in last state, but in current.
        result.push(data);
      }
    }

    return result;
  }

  isNewOverlap(shapeA, shapeB) {
    const idA = shapeA.id | 0,
          idB = shapeB.id | 0;
    const last = this.overlappingShapesLastState;
    const current = this.overlappingShapesCurrentState; // Not in last but in new

    return !last.get(idA, idB) && !!current.get(idA, idB);
  }

  getNewBodyOverlaps(result) {
    this.tmpArray1.length = 0;
    const overlaps = this.getNewOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
  }

  getEndBodyOverlaps(result) {
    this.tmpArray1.length = 0;
    const overlaps = this.getEndOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
  }

  getBodyDiff(overlaps, result) {
    if (result === void 0) {
      result = [];
    }

    const accumulator = this.tmpDict;
    let l = overlaps.length;

    while (l--) {
      const data = overlaps[l]; // Since we use body id's for the accumulator, these will be a subset of the original one

      accumulator.set(data.bodyA.id | 0, data.bodyB.id | 0, data);
    }

    l = accumulator.keys.length;

    while (l--) {
      const data = accumulator.getByKey(accumulator.keys[l]);

      if (data) {
        result.push(data.bodyA, data.bodyB);
      }
    }

    accumulator.reset();
    return result;
  }

}

/**
 * Weighted Quick Union-Find with Path Compression. Based on https://github.com/juzerali/unionfind, but optimized for performance.
 */
class UnionFind {
  constructor(size) {
    this.id = [];
    this.sz = [];
    this.size = size;
    this.count = size;
    this.resize(size);
  }

  resize(size) {
    this.count = this.size = size;
    const sz = this.sz;
    const id = this.id;

    for (let i = 0; i < size; i++) {
      id[i] = i;
      sz[i] = 1;
    }
  }

  find(p) {
    const id = this.id;

    while (p !== id[p]) {
      id[p] = id[id[p]];
      p = id[p];
    }

    return p;
  }
  /**
   * Combine elements in groups p and q into a single group. In other words connect the two groups.
   * @param p
   * @param q
   */


  union(p, q) {
    const i = this.find(p),
          j = this.find(q);

    if (i === j) {
      return;
    }

    const sz = this.sz;
    const id = this.id;

    if (sz[i] < sz[j]) {
      id[i] = j;
      sz[j] += sz[i];
    } else {
      id[j] = i;
      sz[i] += sz[j];
    }

    this.count--;
    return;
  }

}

/**
 * The dynamics world, where all bodies and constraints live.
 *
 * @example
 *     var world = new World({
 *         gravity: [0, -10],
 *         broadphase: new SAPBroadphase()
 *     });
 *     world.addBody(new Body());
 */
class World extends EventEmitter {
  /**
   * Never deactivate bodies.
   */

  /**
   * Deactivate individual bodies if they are sleepy.
   */

  /**
   * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {@link World.islandSplit} for this to work.
   */

  /**
   * All springs in the world. To add a spring to the world, use {@link World.addSpring}.
   */

  /**
   * All bodies in the world. To add a body to the world, use {@link World.addBody}.
   */

  /**
   * True if any bodies are not sleeping, false if every body is sleeping.
   */

  /**
   * The narrowphase to use to generate contacts.
   */

  /**
   * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
   * @default true
   */

  /**
   * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
   * @default true
   */

  /**
   * User-added constraints.
   */

  /**
   * For keeping track of what time step size we used last step
   */

  /**
   * Enable to automatically apply spring forces each step.
   * @default true
   */

  /**
   * Enable to automatically apply body damping each step.
   * @default true
   */

  /**
   * Enable to automatically apply gravity each step.
   * @default true
   */

  /**
   * Enable/disable constraint solving in each step.
   * @default true
   */

  /**
   * The ContactMaterials added to the World.
   */

  /**
   * World time.
   */

  /**
   * Accumulator for the world
   */

  /**
   * Is true during step().
   */

  /**
   * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
   * @default true
   * @deprecated Impact event will be removed. Use beginContact instead.
   */

  /**
   * How to deactivate bodies during simulation. Possible modes are: {@link World,NO_SLEEPING}, {@link World.BODY_SLEEPING} and {@link World.ISLAND_SLEEPING}.
   * If sleeping is enabled, you might need to {@link Body.wakeUp} the bodies if they fall asleep when they shouldn't.
   * If you want to enable sleeping in the world, but want to disable it for a particular body, see {@link Body.allowSleep}.
   * @default World.NO_SLEEPING
   */

  /**
   * Overlap keeper for the world
   */

  /**
   * Disabled body collision pairs. See {@link World.disableBodyCollision}.
   */

  /**
   * Constructor for a p2-es World
   * @param options options for creating the world
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    super();
    this.springs = [];
    this.bodies = [];
    this.hasActiveBodies = false;
    this.narrowphase = new Narrowphase();
    this.useWorldGravityAsFrictionGravity = true;
    this.useFrictionGravityOnZeroGravity = true;
    this.constraints = [];
    this.lastTimeStep = 1 / 60;
    this.applySpringForces = true;
    this.applyDamping = true;
    this.applyGravity = true;
    this.solveConstraints = true;
    this.contactMaterials = [];
    this.time = 0.0;
    this.accumulator = 0;
    this.stepping = false;
    this.emitImpactEvent = true;
    this.sleepMode = World.NO_SLEEPING;
    this.overlapKeeper = new OverlapKeeper();
    this.disabledBodyCollisionPairs = [];
    this.unionFind = new UnionFind(1);
    this.solver = options.solver || new GSSolver();
    this.gravity = fromValues(0, -9.78);

    if (options.gravity) {
      copy(this.gravity, options.gravity);
    }

    this.frictionGravity = length(this.gravity) || 10;
    this.broadphase = options.broadphase || new SAPBroadphase();
    this.broadphase.setWorld(this);
    this.defaultMaterial = new Material();
    this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial);
    this.islandSplit = options.islandSplit ?? true;
  }
  /**
   * Add a constraint to the simulation. Note that both bodies connected to the constraint must be added to the world first. Also note that you can't run this method during step.
   * @param constraint
   *
   * @example
   *     var constraint = new LockConstraint(bodyA, bodyB);
   *     world.addConstraint(constraint);
   */


  addConstraint(constraint) {
    if (this.stepping) {
      throw new Error('Constraints cannot be added during step.');
    }

    const bodies = this.bodies;

    if (bodies.indexOf(constraint.bodyA) === -1) {
      throw new Error('Cannot add Constraint: bodyA is not added to the World.');
    }

    if (bodies.indexOf(constraint.bodyB) === -1) {
      throw new Error('Cannot add Constraint: bodyB is not added to the World.');
    }

    this.constraints.push(constraint);
  }
  /**
   * Add a ContactMaterial to the simulation.
   * @param contactMaterial
   */


  addContactMaterial(contactMaterial) {
    this.contactMaterials.push(contactMaterial);
  }
  /**
   * Removes a contact material
   * @param cm
   */


  removeContactMaterial(cm) {
    arrayRemove(this.contactMaterials, cm);
  }
  /**
   * Get a contact material given two materials
   * @param materialA
   * @param materialB
   * @todo Use faster hash map to lookup from material id's
   */


  getContactMaterial(materialA, materialB) {
    const cmats = this.contactMaterials;

    for (let i = 0, N = cmats.length; i !== N; i++) {
      const cm = cmats[i];

      if (cm.materialA === materialA && cm.materialB === materialB || cm.materialA === materialB && cm.materialB === materialA) {
        return cm;
      }
    }

    return false;
  }
  /**
   * Removes a constraint. Note that you can't run this method during step.
   * @param constraint
   */


  removeConstraint(constraint) {
    if (this.stepping) {
      throw new Error('Constraints cannot be removed during step.');
    }

    arrayRemove(this.constraints, constraint);
  }
  /**
   * Step the physics world forward in time.
   *
   * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
   *
   * @param dt The fixed time step size to use.
   * @param timeSinceLastCalled The time elapsed since the function was last called.
   * @param maxSubSteps Maximum number of fixed steps to take per function call.
   *
   * @example
   *     // Simple fixed timestepping without interpolation
   *     var fixedTimeStep = 1 / 60;
   *     var world = new World();
   *     var body = new Body({ mass: 1 });
   *     world.addBody(body);
   *
   *     function animate(){
   *         requestAnimationFrame(animate);
   *         world.step(fixedTimeStep);
   *         renderBody(body.position, body.angle);
   *     }
   *
   *     // Start animation loop
   *     requestAnimationFrame(animate);
   *
   * @example
   *     // Fixed timestepping with interpolation
   *     var maxSubSteps = 10;
   *     var lastTimeSeconds;
   *
   *     function animate(time){
   *         requestAnimationFrame(animate);
   *         var timeSeconds = time / 1000;
   *
   *         if(lastTimeSeconds){
   *             var deltaTime = timeSeconds - lastTimeSeconds;
   *             world.step(fixedTimeStep, deltaTime, maxSubSteps);
   *         }
   *
   *         lastTimeSeconds = timeSeconds;
   *
   *         renderBody(body.interpolatedPosition, body.interpolatedAngle);
   *     }
   *
   *     // Start animation loop
   *     requestAnimationFrame(animate);
   *
   * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
   */


  step(dt, timeSinceLastCalled, maxSubSteps) {
    if (maxSubSteps === void 0) {
      maxSubSteps = 10;
    }

    if (timeSinceLastCalled === undefined) {
      // Fixed, simple stepping
      this.internalStep(dt); // Increment time

      this.time += dt;
    } else {
      this.accumulator += timeSinceLastCalled;
      let substeps = 0;

      while (this.accumulator >= dt && substeps < maxSubSteps) {
        // Do fixed steps to catch up
        this.internalStep(dt);
        this.time += dt;
        this.accumulator -= dt;
        substeps++;
      }

      const t = this.accumulator % dt / dt;

      for (let j = 0; j !== this.bodies.length; j++) {
        const b = this.bodies[j];
        lerp(b.interpolatedPosition, b.previousPosition, b.position, t);
        b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle);
      }
    }
  }
  /**
   * Make a fixed step.
   * @param dt
   */


  internalStep(dt) {
    this.stepping = true;
    const Nsprings = this.springs.length,
          springs = this.springs,
          bodies = this.bodies,
          g = this.gravity,
          solver = this.solver,
          Nbodies = this.bodies.length,
          broadphase = this.broadphase,
          np = this.narrowphase,
          constraints = this.constraints,
          mg = step_mg,
          add$1 = add;
    this.overlapKeeper.tick();
    this.lastTimeStep = dt; // Update approximate friction gravity.

    if (this.useWorldGravityAsFrictionGravity) {
      const gravityLen = length(this.gravity);

      if (!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)) {
        // Nonzero gravity. Use it.
        this.frictionGravity = gravityLen;
      }
    } // Add gravity to bodies


    if (this.applyGravity) {
      for (let i = 0; i !== Nbodies; i++) {
        const b = bodies[i],
              fi = b.force;

        if (b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING) {
          continue;
        }

        scale(mg, g, b.mass * b.gravityScale); // F=m*g

        add$1(fi, fi, mg);
      }
    } // Add spring forces


    if (this.applySpringForces) {
      for (let i = 0; i !== Nsprings; i++) {
        const s = springs[i];
        s.applyForce();
      }
    } // Apply damping


    if (this.applyDamping) {
      for (let i = 0; i !== Nbodies; i++) {
        const b = bodies[i];

        if (b.type === Body.DYNAMIC) {
          b.applyDamping(dt);
        }
      }
    } // Get Broadphase collision pairs


    const result = broadphase.getCollisionPairs(this); // Remove ignored collision pairs

    const ignoredPairs = this.disabledBodyCollisionPairs;

    for (let i = ignoredPairs.length - 2; i >= 0; i -= 2) {
      for (let j = result.length - 2; j >= 0; j -= 2) {
        if (ignoredPairs[i] === result[j] && ignoredPairs[i + 1] === result[j + 1] || ignoredPairs[i + 1] === result[j] && ignoredPairs[i] === result[j + 1]) {
          result.splice(j, 2);
        }
      }
    } // Remove constrained pairs with collideConnected == false


    let Nconstraints = constraints.length;

    for (let i = 0; i !== Nconstraints; i++) {
      const c = constraints[i];

      if (!c.collideConnected) {
        for (let j = result.length - 2; j >= 0; j -= 2) {
          if (c.bodyA === result[j] && c.bodyB === result[j + 1] || c.bodyB === result[j] && c.bodyA === result[j + 1]) {
            result.splice(j, 2);
          }
        }
      }
    } // postBroadphase event


    this.emit({
      type: 'postBroadphase',
      pairs: result
    }); // Narrowphase

    np.reset();
    const defaultContactMaterial = this.defaultContactMaterial;
    const frictionGravity = this.frictionGravity;

    for (let i = 0, Nresults = result.length; i !== Nresults; i += 2) {
      const bi = result[i];
      const bj = result[i + 1]; // Loop over all shapes of body i

      for (let k = 0, Nshapesi = bi.shapes.length; k !== Nshapesi; k++) {
        const si = bi.shapes[k];
        const xi = si.position;
        const ai = si.angle; // All shapes of body j

        for (let l = 0, Nshapesj = bj.shapes.length; l !== Nshapesj; l++) {
          const sj = bj.shapes[l];
          const xj = sj.position;
          const aj = sj.angle;
          let contactMaterial = false;

          if (si.material && sj.material) {
            contactMaterial = this.getContactMaterial(si.material, sj.material);
          }

          runNarrowphase(this, np, bi, si, xi, ai, bj, sj, xj, aj, contactMaterial || defaultContactMaterial, frictionGravity);
        }
      }
    } // Wake up bodies


    for (let i = 0; i !== Nbodies; i++) {
      const body = bodies[i];

      if (body._wakeUpAfterNarrowphase) {
        body.wakeUp();
        body._wakeUpAfterNarrowphase = false;
      }
    } // Emit end overlap events


    if (this.has('endContact')) {
      this.overlapKeeper.getEndOverlaps(endOverlaps);
      let l = endOverlaps.length;

      while (l--) {
        const data = endOverlaps[l];
        const e = {
          type: 'endContact',
          shapeA: data.shapeA,
          shapeB: data.shapeB,
          bodyA: data.bodyA,
          bodyB: data.bodyB
        };
        this.emit(e);
      }

      endOverlaps.length = 0;
    }

    this.emit({
      type: 'preSolve',
      contactEquations: np.contactEquations,
      frictionEquations: np.frictionEquations
    }); // update constraint equations

    Nconstraints = constraints.length;

    for (let i = 0; i !== Nconstraints; i++) {
      constraints[i].update();
    }

    if (np.contactEquations.length || np.frictionEquations.length || Nconstraints) {
      // Get all equations
      let equations = [];
      appendArray(equations, np.contactEquations);
      appendArray(equations, np.frictionEquations);

      for (let i = 0; i !== Nconstraints; i++) {
        appendArray(equations, constraints[i].equations);
      }

      if (this.islandSplit) {
        // Initialize the UnionFind
        const unionFind = this.unionFind;
        unionFind.resize(this.bodies.length + 1); // Update equation index

        for (let i = 0; i < equations.length; i++) {
          equations[i].index = i;
        } // Unite bodies if they are connected by an equation


        for (let i = 0; i < equations.length; i++) {
          const bodyA = equations[i].bodyA;
          const bodyB = equations[i].bodyB;

          if (bodyA.type === Body.DYNAMIC && bodyB.type === Body.DYNAMIC) {
            unionFind.union(bodyA.index, bodyB.index);
          }
        } // Find the body islands


        for (let i = 0; i < bodies.length; i++) {
          const body = bodies[i];
          body.islandId = body.type === Body.DYNAMIC ? unionFind.find(body.index) : -1;
        } // Sort equations by island


        equations = equations.sort(sortEquationsByIsland);
        let equationIndex = 0;

        while (equationIndex < equations.length) {
          const equation = equations[equationIndex++];
          solver.addEquation(equation);
          const currentIslandId = equation.bodyA.islandId > 0 ? equation.bodyA.islandId : equation.bodyB.islandId;
          let nextIslandId = -1;

          if (equations[equationIndex]) {
            nextIslandId = equations[equationIndex].bodyA.islandId > 0 ? equations[equationIndex].bodyA.islandId : equations[equationIndex].bodyB.islandId;
          }

          if (nextIslandId !== currentIslandId || equationIndex === equations.length) {
            // Solve this island
            if (this.solveConstraints) {
              solver.solve(dt, this);
            }

            solver.removeAllEquations();
          }
        }
      } else {
        // Solve all as one island
        solver.addEquations(equations);

        if (this.solveConstraints) {
          solver.solve(dt, this);
        }

        solver.removeAllEquations();
      }
    } // Step forward


    for (let i = 0; i !== Nbodies; i++) {
      const body = bodies[i];

      if (body.type === Body.DYNAMIC || body.type === Body.KINEMATIC) {
        body.integrate(dt);
      }
    } // Reset force


    for (let i = 0; i !== Nbodies; i++) {
      bodies[i].setZeroForce();
    } // Emit impact event


    if (this.emitImpactEvent && this.has('impact')) {
      for (let i = 0; i !== np.contactEquations.length; i++) {
        const eq = np.contactEquations[i];

        if (eq.firstImpact) {
          this.emit({
            type: 'impact',
            bodyA: eq.bodyA,
            bodyB: eq.bodyB,
            shapeA: eq.shapeA,
            shapeB: eq.shapeB,
            contactEquation: eq
          });
        }
      }
    } // Sleeping update


    let hasActiveBodies = true;

    if (this.sleepMode === World.BODY_SLEEPING) {
      hasActiveBodies = false;

      for (let i = 0; i !== Nbodies; i++) {
        const body = bodies[i];
        body.sleepTick(this.time, false, dt); // Check if the body is not sleeping

        if (body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC) {
          hasActiveBodies = true;
        }
      }
    } else if (this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit) {
      // Tell all bodies to sleep tick but dont sleep yet
      for (let i = 0; i !== Nbodies; i++) {
        bodies[i].sleepTick(this.time, true, dt);
      } // Sleep islands


      const bodiesSortedByIsland = bodies.sort(sortBodiesByIsland);
      let islandEnd = 1;

      for (let islandStart = 0; islandStart < bodiesSortedByIsland.length; islandStart = islandEnd) {
        const islandId = bodiesSortedByIsland[islandStart].islandId; // Get islandEnd index

        for (islandEnd = islandStart + 1; islandEnd < bodiesSortedByIsland.length && bodiesSortedByIsland[islandEnd].islandId === islandId; islandEnd++ // eslint-disable-next-line no-empty
        ) {} // Don't check static objects


        if (islandId === -1) {
          continue;
        }

        let islandShouldSleep = true;

        for (let i = islandStart; i < islandEnd; i++) {
          if (!bodiesSortedByIsland[i].wantsToSleep) {
            islandShouldSleep = false;
            break;
          }
        }

        if (islandShouldSleep) {
          for (let i = islandStart; i < islandEnd; i++) {
            bodiesSortedByIsland[i].sleep();
          }
        }
      } // Check if any bodies are not sleeping


      hasActiveBodies = false;

      for (let i = 0; i !== Nbodies; i++) {
        const body = bodies[i];

        if (body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC) {
          hasActiveBodies = true;
          break;
        }
      }
    }

    this.hasActiveBodies = hasActiveBodies;
    this.stepping = false;
    this.emit({
      type: 'postStep'
    });
  }
  /**
   * Add a spring to the simulation. Note that this operation can't be done during step.
   * @param spring
   */


  addSpring(spring) {
    if (this.stepping) {
      throw new Error('Springs cannot be added during step.');
    }

    this.springs.push(spring);
    this.emit({
      type: 'addSpring',
      spring
    });
  }
  /**
   * Remove a spring. Note that this operation can't be done during step.
   * @param spring
   */


  removeSpring(spring) {
    if (this.stepping) {
      throw new Error('Springs cannot be removed during step.');
    }

    arrayRemove(this.springs, spring);
  }
  /**
   * Add a body to the simulation. Note that you can't add a body during step: you have to wait until after the step (see the postStep event).
   * Also note that bodies can only be added to one World at a time.
   * @param body
   *
   * @example
   *     var world = new World(),
   *         body = new Body();
   *     world.addBody(body);
   */


  addBody(body) {
    if (this.stepping) {
      throw new Error('Bodies cannot be added during step.');
    } // Already added?


    if (body.world) {
      throw new Error('Body is already added to a World.');
    }

    body.index = this.bodies.length;
    this.bodies.push(body);
    body.world = this;
    this.emit({
      type: 'addBody',
      body
    });
  }
  /**
   * Remove a body from the simulation. Note that bodies cannot be removed during step (for example, inside the beginContact event). In that case you need to wait until the step is done (see the postStep event).
   *
   * Also note that any constraints connected to the body must be removed before the body.
   *
   * @param body
   *
   * @example
   *     var removeBody;
   *     world.on("beginContact",function(event){
   *         // We cannot remove the body here since the world is still stepping.
   *         // Instead, schedule the body to be removed after the step is done.
   *         removeBody = body;
   *     });
   *     world.on("postStep",function(event){
   *         if(removeBody){
   *             // Safely remove the body from the world.
   *             world.removeBody(removeBody);
   *             removeBody = null;
   *         }
   *     });
   */


  removeBody(body) {
    if (this.stepping) {
      throw new Error('Bodies cannot be removed during step.');
    } // TODO: would it be smart to have a .constraints array on the body?


    const constraints = this.constraints;
    let l = constraints.length;

    while (l--) {
      if (constraints[l].bodyA === body || constraints[l].bodyB === body) {
        throw new Error('Cannot remove Body from World: it still has constraints connected to it.');
      }
    }

    body.world = null;
    const bodies = this.bodies;
    arrayRemove(bodies, body);
    body.index = -1;
    l = bodies.length;

    while (l--) {
      bodies[l].index = l;
    }

    body.resetConstraintVelocity(); // Emit removeBody event

    this.emit({
      type: 'removeBody',
      body
    }); // Remove disabled body collision pairs that involve body

    const pairs = this.disabledBodyCollisionPairs;
    let i = 0;

    while (i < pairs.length) {
      if (pairs[i] === body || pairs[i + 1] === body) {
        pairs.splice(i, 2);
      } else {
        i += 2;
      }
    }
  }
  /**
   * Get a body by its id.
   * @param id
   * @returns The body, or false if it was not found.
   */


  getBodyByID(id) {
    const bodies = this.bodies;

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];

      if (b.id === id) {
        return b;
      }
    }

    return false;
  }
  /**
   * Disable collision between two bodies
   * @param bodyA
   * @param bodyB
   */


  disableBodyCollision(bodyA, bodyB) {
    this.disabledBodyCollisionPairs.push(bodyA, bodyB);
  }
  /**
   * Enable collisions between the given two bodies, if they were previously disabled using .disableBodyCollision().
   * @param bodyA
   * @param bodyB
   */


  enableBodyCollision(bodyA, bodyB) {
    const pairs = this.disabledBodyCollisionPairs;

    for (let i = 0; i < pairs.length; i += 2) {
      if (pairs[i] === bodyA && pairs[i + 1] === bodyB || pairs[i + 1] === bodyA && pairs[i] === bodyB) {
        pairs.splice(i, 2);
        return;
      }
    }
  }
  /**
   * Removes all bodies, constraints, springs, and contact materials from the world.
   */


  clear() {
    // Remove all solver equations
    this.solver.removeAllEquations(); // Remove all constraints

    const cs = this.constraints;
    let i = cs.length;

    while (i--) {
      this.removeConstraint(cs[i]);
    } // Remove all bodies


    const bodies = this.bodies;
    i = bodies.length;

    while (i--) {
      this.removeBody(bodies[i]);
    } // Remove all springs


    const springs = this.springs;
    i = springs.length;

    while (i--) {
      this.removeSpring(springs[i]);
    } // Remove all contact materials


    const cms = this.contactMaterials;
    i = cms.length;

    while (i--) {
      this.removeContactMaterial(cms[i]);
    }
  }
  /**
   * Test if a world point overlaps bodies
   * @param worldPoint Point to use for intersection tests
   * @param bodies A list of objects to check for intersection
   * @param precision Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
   * @returns Array of bodies that overlap the point
   *
   * @todo Should use an api similar to the raycast function
   * @todo Should probably implement a .containsPoint method for all shapes. Would be more efficient
   * @todo Should use the broadphase
   * @todo Returning the hit shape would be fine - it carries a reference to the body now
   */


  hitTest(worldPoint, bodies, precision) {
    if (precision === void 0) {
      precision = 0;
    }

    // Create a dummy particle body with a particle shape to test against the bodies
    const shapeWorldPosition = hitTest_tmp1,
          shapeLocalPoint = hitTest_tmp2;
    const result = []; // Check bodies

    for (let i = 0, N = bodies.length; i !== N; i++) {
      const body = bodies[i];

      for (let j = 0, NS = body.shapes.length; j !== NS; j++) {
        const shape = body.shapes[j]; // Get local point position in the shape

        shape.worldPointToLocal(shapeLocalPoint, worldPoint);

        if (shape.pointTest(shapeLocalPoint)) {
          result.push(body);
        } else {
          // Get shape world position
          rotate(shapeWorldPosition, shape.position, body.angle);
          add(shapeWorldPosition, shapeWorldPosition, body.position);

          if (shape.type === Shape.PARTICLE && squaredDistance(shapeWorldPosition, worldPoint) < precision * precision) {
            result.push(body);
          }
        }
      }
    }

    return result;
  }
  /**
   * Set the stiffness for all equations and contact materials.
   * @param stiffness
   */


  setGlobalStiffness(stiffness) {
    this.setGlobalEquationParameters({
      stiffness: stiffness
    }); // Set for all contact materials

    const contactMaterials = this.contactMaterials;

    for (let i = 0; i !== contactMaterials.length; i++) {
      const c = contactMaterials[i];
      c.stiffness = c.frictionStiffness = stiffness;
    } // Set for default contact material


    const c = this.defaultContactMaterial;
    c.stiffness = c.frictionStiffness = stiffness;
  }
  /**
   * Set the relaxation for all equations and contact materials.
   * @param relaxation
   */


  setGlobalRelaxation(relaxation) {
    this.setGlobalEquationParameters({
      relaxation: relaxation
    }); // Set for all contact materials

    for (let i = 0; i !== this.contactMaterials.length; i++) {
      const c = this.contactMaterials[i];
      c.relaxation = c.frictionRelaxation = relaxation;
    } // Set for default contact material


    const c = this.defaultContactMaterial;
    c.relaxation = c.frictionRelaxation = relaxation;
  }
  /**
   * Ray cast against all bodies in the world.
   * @param result
   * @param ray
   * @return true if any body was hit
   * @example
   *     var ray = new Ray({
   *         mode: Ray.ALL,
   *         from: [0, 0],
   *         to: [10, 0],
   *         callback: function(result){
   *
   *             // Print some info about the hit
   *             console.log('Hit body and shape: ', result.body, result.shape);
   *
   *             // Get the hit point
   *             var hitPoint = vec2.create();
   *             result.getHitPoint(hitPoint, ray);
   *             console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
   *
   *             // If you are happy with the hits you got this far, you can stop the traversal here:
   *             result.stop();
   *         }
   *     });
   *     var result = new RaycastResult();
   *     world.raycast(result, ray);
   * @param result
   * @param ray
   */


  raycast(result, ray) {
    // Get all bodies within the ray AABB
    ray.getAABB(tmpRaycastAABB);
    this.broadphase.aabbQuery(this, tmpRaycastAABB, tmpRaycastArray);
    ray.intersectBodies(result, tmpRaycastArray);
    tmpRaycastArray.length = 0;
    return result.hasHit();
  }

  setGlobalEquationParameters(parameters) {
    const constraints = this.constraints;

    for (let i = 0; i !== constraints.length; i++) {
      const c = constraints[i];
      const eqs = c.equations;

      for (let j = 0; j !== eqs.length; j++) {
        const eq = eqs[j];
        eq.relaxation = parameters.relaxation ?? eq.relaxation;
        eq.stiffness = parameters.stiffness ?? eq.stiffness;
        eq.needsUpdate = true;
      }
    }
  }

}
World.NO_SLEEPING = 1;
World.BODY_SLEEPING = 2;
World.ISLAND_SLEEPING = 4;

function sortBodiesByIsland(a, b) {
  return a.islandId - b.islandId;
}

function sortEquationsByIsland(equationA, equationB) {
  const islandA = equationA.bodyA.islandId > 0 ? equationA.bodyA.islandId : equationA.bodyB.islandId;
  const islandB = equationB.bodyA.islandId > 0 ? equationB.bodyA.islandId : equationB.bodyB.islandId;

  if (islandA !== islandB) {
    return islandA - islandB;
  } else {
    // Sort by equation type if same island
    return equationA.index - equationB.index;
  }
} // Check collision groups and masks


function runNarrowphase(world, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {
  if (!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)) {
    return;
  } // Get world position and angle of each shape


  toGlobalFrame(xiw, xi, bi.position, bi.angle);
  toGlobalFrame(xjw, xj, bj.position, bj.angle);

  if (distance(xiw, xjw) > si.boundingRadius + sj.boundingRadius) {
    return;
  }

  const aiw = ai + bi.angle;
  const ajw = aj + bj.angle;
  np.enableFriction = cm.friction > 0;
  let reducedMass;

  if (bi.type === Body.STATIC || bi.type === Body.KINEMATIC) {
    reducedMass = bj.mass;
  } else if (bj.type === Body.STATIC || bj.type === Body.KINEMATIC) {
    reducedMass = bi.mass;
  } else {
    reducedMass = bi.mass * bj.mass / (bi.mass + bj.mass);
  }

  np.slipForce = cm.friction * glen * reducedMass;
  np.currentContactMaterial = cm;
  np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;
  const resolver = np.narrowphases[si.type | sj.type];
  let numContacts = 0;

  if (resolver) {
    const sensor = si.sensor || sj.sensor;
    const numFrictionBefore = np.frictionEquations.length;

    if (si.type < sj.type) {
      numContacts = resolver.call(np, bi, si, xiw, aiw, bj, sj, xjw, ajw, sensor);
    } else {
      numContacts = resolver.call(np, bj, sj, xjw, ajw, bi, si, xiw, aiw, sensor);
    }

    const numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

    if (numContacts) {
      if (bi.allowSleep && bi.type === Body.DYNAMIC && bi.sleepState === Body.SLEEPING && bj.sleepState === Body.AWAKE && bj.type !== Body.STATIC) {
        const speedSquaredB = squaredLength(bj.velocity) + Math.pow(bj.angularVelocity, 2);
        const speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2);

        if (speedSquaredB >= speedLimitSquaredB * 2) {
          bi._wakeUpAfterNarrowphase = true;
        }
      }

      if (bj.allowSleep && bj.type === Body.DYNAMIC && bj.sleepState === Body.SLEEPING && bi.sleepState === Body.AWAKE && bi.type !== Body.STATIC) {
        const speedSquaredA = squaredLength(bi.velocity) + Math.pow(bi.angularVelocity, 2);
        const speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2);

        if (speedSquaredA >= speedLimitSquaredA * 2) {
          bj._wakeUpAfterNarrowphase = true;
        }
      }

      world.overlapKeeper.setOverlapping(bi, si, bj, sj);

      if (world.has('beginContact') && world.overlapKeeper.isNewOverlap(si, sj)) {
        // Report new shape overlap
        const equations = [];

        if (!sensor) {
          for (let i = np.contactEquations.length - numContacts; i < np.contactEquations.length; i++) {
            equations.push(np.contactEquations[i]);
          }
        }

        world.emit({
          type: 'beginContact',
          shapeA: si,
          shapeB: sj,
          bodyA: bi,
          bodyB: bj,
          contactEquations: equations
        });
      } // divide the max friction force by the number of contacts


      if (!sensor && numFrictionEquations > 1) {
        // Why divide by 1?
        for (let i = np.frictionEquations.length - numFrictionEquations; i < np.frictionEquations.length; i++) {
          const f = np.frictionEquations[i];
          f.setSlipForce(f.getSlipForce() / numFrictionEquations);
        }
      }
    }
  }
}

const tmpRaycastAABB = new AABB();
const tmpRaycastArray = [];
const step_mg = create(),
      xiw = create(),
      xjw = create();
const endOverlaps = [];
const hitTest_tmp1 = create(),
      hitTest_tmp2 = create();

export { AABB, AngleLockEquation, Body, Box, Broadphase, Capsule, Circle, Constraint, ContactEquation, ContactEquationPool, ContactMaterial, Convex, DistanceConstraint, Equation, EventEmitter, FrictionEquation, FrictionEquationPool, GSSolver, GearConstraint, Heightfield, Line, LinearSpring, LockConstraint, Material, NaiveBroadphase, Narrowphase, Particle, Plane, Pool, PrismaticConstraint, Ray, RaycastResult, RevoluteConstraint, RotationalSpring, RotationalVelocityEquation, SAPBroadphase, Shape, Solver, Spring, TopDownVehicle, Utils, WheelConstraint, World, vec2 };
