import { createStyledBreakpointsTheme } from 'styled-breakpoints'
import styled, { DefaultTheme } from 'styled-components'
import { interfaceTheme } from './theme'

export const styledComponentsTheme = createStyledBreakpointsTheme()

export const up =
    (name: string) =>
    ({ theme }: { theme: DefaultTheme }) =>
        theme.breakpoints.up(name)

export const SandboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    height: 100%;

    &:focus {
        outline: none;
    }
`

export const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;

    &.settings-enabled {
        overflow: auto;

        ${up('md')} {
            overflow: hidden;
        }
    }

    ${up('md')} {
        flex-direction: row;
    }
`

export const CanvasWrapper = styled.div`
    position: relative;

    flex: 1;
    width: 100%;

    min-height: 70%;
    max-height: 70%;
    height: 70%;

    &.settings-hidden {
        min-height: 100%;
        max-height: 100%;
        height: 100%;
    }

    ${up('md')} {
        min-height: unset;
        max-height: unset;
        height: 100%;
    }

    &:focus,
    &:focus-visible,
    &:focus-within {
        outline: none;
    }
`

export const ControlsWrapper = styled.div`
    flex: 1;
    width: 100%;
    min-height: 300px;
    background-color: ${interfaceTheme.color.background};

    ${up('md')} {
        flex: none;
        width: 320px;
        height: 100%;
        min-height: unset;
        overflow-y: scroll;
    }
`
