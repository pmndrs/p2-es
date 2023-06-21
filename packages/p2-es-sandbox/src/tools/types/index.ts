export const Tools = {
    PICK_PAN: 'pickpan',
    POLYGON: 'polygon',
    CIRCLE: 'circle',
    RECTANGLE: 'rectangle',
} as const

export type Tool = (typeof Tools)[keyof typeof Tools]
