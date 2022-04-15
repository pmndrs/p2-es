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

export function getArea(p: number[]): number {
  if (p.length < 6) return 0
  const l = p.length - 2
  let sum = 0
  for (let i = 0; i < l; i += 2) sum += (p[i + 2] - p[i]) * (p[i + 1] + p[i + 3])
  sum += (p[0] - p[l]) * (p[l + 1] + p[1])
  return -sum * 0.5
}

export function triangulate(p: number[]) {
  const n = p.length >> 1
  if (n < 3) return []
  const tgs = []
  const avl = []
  for (let i = 0; i < n; i++) avl.push(i)

  let i = 0
  let al = n
  while (al > 3) {
    const i0 = avl[(i + 0) % al]
    const i1 = avl[(i + 1) % al]
    const i2 = avl[(i + 2) % al]

    const ax = p[2 * i0],
      ay = p[2 * i0 + 1]
    const bx = p[2 * i1],
      by = p[2 * i1 + 1]
    const cx = p[2 * i2],
      cy = p[2 * i2 + 1]

    let earFound = false
    if (convex(ax, ay, bx, by, cx, cy)) {
      earFound = true
      for (let j = 0; j < al; j++) {
        const vi = avl[j]
        if (vi == i0 || vi == i1 || vi == i2) continue
        if (pointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
          earFound = false
          break
        }
      }
    }
    if (earFound) {
      tgs.push(i0, i1, i2)
      avl.splice((i + 1) % al, 1)
      al--
      i = 0
    } else if (i++ > 3 * al) break // no convex angles :(
  }
  tgs.push(avl[0], avl[1], avl[2])
  return tgs
}

function pointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const v0x = cx - ax
  const v0y = cy - ay
  const v1x = bx - ax
  const v1y = by - ay
  const v2x = px - ax
  const v2y = py - ay

  const dot00 = v0x * v0x + v0y * v0y
  const dot01 = v0x * v1x + v0y * v1y
  const dot02 = v0x * v2x + v0y * v2y
  const dot11 = v1x * v1x + v1y * v1y
  const dot12 = v1x * v2x + v1y * v2y

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom

  // Check if point is in triangle
  return u >= 0 && v >= 0 && u + v < 1
}

function convex(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
  return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0
}
