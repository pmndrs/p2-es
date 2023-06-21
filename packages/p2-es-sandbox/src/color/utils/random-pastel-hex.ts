import { rgbToHex } from './rgb-to-hex'

/**
 * Returns a random pastel color hex
 * @returns {number} random pastel color hex
 */
export const randomPastelHex = () => {
    const mix = [255, 255, 255]
    let red = Math.floor(Math.random() * 256)
    let green = Math.floor(Math.random() * 256)
    let blue = Math.floor(Math.random() * 256)

    // mix the color
    red = Math.floor((red + 3 * mix[0]) / 4)
    green = Math.floor((green + 3 * mix[1]) / 4)
    blue = Math.floor((blue + 3 * mix[2]) / 4)

    return rgbToHex(red, green, blue)
}
