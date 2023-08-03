export * from './circle-tool'
export * from './pick-pan-tool'
export * from './polygon-tool'
export * from './rectangle-tool'

export const Tools = {
    PICK_PAN: 'pickpan',
    POLYGON: 'polygon',
    CIRCLE: 'circle',
    RECTANGLE: 'rectangle',
} as const

export type Tool = (typeof Tools)[keyof typeof Tools]
