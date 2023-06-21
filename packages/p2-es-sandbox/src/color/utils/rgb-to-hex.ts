const componentToHex = (c: number) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

/**
 * RGB to hex
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns
 */
export const rgbToHex = (r: number, g: number, b: number) => {
    return componentToHex(r) + componentToHex(g) + componentToHex(b)
}
