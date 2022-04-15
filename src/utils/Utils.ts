export class Utils {
  /**
   * The array type to use for internal numeric computations throughout the library.
   * Float32Array is used if it is available, but falls back on Array.
   * If you want to set array type manually, inject it via the global variable P2_ARRAY_TYPE.
   * See example below.
   * @example
   *     <script>
   *         <!-- Inject your preferred array type before loading p2.js -->
   *         P2_ARRAY_TYPE = Array;
   *     </script>
   *     <script src="p2.js"></script>
   */
  static ARRAY_TYPE: new (n: number) => Float32Array | number[] = (() => {
    if (typeof P2_ARRAY_TYPE !== 'undefined') {
      return P2_ARRAY_TYPE
    } else if (typeof Float32Array !== 'undefined') {
      return Float32Array
    } else {
      return Array
    }
  })()

  /**
   * Append the values in array b to the array a.
   * @param a the array to append to
   * @param b the array to append values from
   */
  static appendArray(a: any[], b: any[]): void {
    for (let i = 0, len = b.length; i !== len; ++i) {
      a.push(b[i])
    }
  }

  /**
   * Garbage free Array.splice(). Does not allocate a new array.
   * @param array
   * @param index
   * @param howmany
   */
  static splice(array: any[], index: number, howmany= 1): void {
    const len = array.length - howmany
    for (let i = index; i < len; i++) {
      array[i] = array[i + howmany]
    }
    array.length = len
  }

  /**
   * Remove an element from an array, if the array contains the element.
   * @param array
   * @param element
   */
  static arrayRemove(array: any[], element: any): void {
    const idx = array.indexOf(element)
    if (idx !== -1) {
      Utils.splice(array, idx, 1)
    }
  }

  /**
   * Extend an object with the properties of another
   * @param a
   * @param b
   */
  static extend(a: any, b: any) {
    for (const key in b) {
      a[key] = b[key]
    }
  }

  /**
   * Shallow clone an object. Returns a new object instance with the same properties as the input instance.
   * @param obj
   */
  static shallowClone(obj: any) {
    const newObj = {}
    Utils.extend(newObj, obj)
    return newObj
  }
}
