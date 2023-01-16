/**
 * Component to hex
 * @param {number} c
 * @returns
 */
export const componentToHex = (c: number) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}
