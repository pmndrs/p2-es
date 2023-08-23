import { LevaCustomTheme } from 'leva/dist/declarations/src/styles'

export const levaTheme: LevaCustomTheme = {
    sizes: {
        controlWidth: '80px',
    },
    colors: {
        highlight1: '#ccc',
        highlight2: '#ddd',
    },
}

export const interfaceTheme = {
    color: {
        background: '#181c20',
        backgroundLight: '#2f353b',
        highlight1: '#efefef',
        highlight2: '#ccc',
        highlight3: '#ddd',
    },
}

export const canvasTheme = {
    background: 0xffffff,
    lineWidth: 0.01,
    body: {
        lineColor: 0x000000,
        highlight: 0xeeeeee,
        sleeping: {
            opacity: 0.4,
        },
        static: {
            fillColor: 0xdddddd,
        },
        drawing: {
            lineColor: 0x000000,
        },
    },
    spring: {
        lineColor: 0x000000,
    },
    aabb: {
        lineColor: 0x000000,
    },
    contact: {
        lineColor: 0x222222,
    },
}
