export const Tool = {
    CIRCLE: 'circle',
    PICK_PAN: 'pick-pan',
    POLYGON: 'polygon',
    RECTANGLE: 'rectangle'
}

export type Tool = typeof Tool[keyof typeof Tool]