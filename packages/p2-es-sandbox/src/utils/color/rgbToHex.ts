import { componentToHex } from './componentToHex'

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
