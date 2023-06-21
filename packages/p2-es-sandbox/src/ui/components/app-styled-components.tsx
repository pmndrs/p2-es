import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { interfaceTheme } from '../constants/interface-theme'

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;

    ${up('md')} {
        height: 100%;
    }

    &:focus {
        outline: none;
    }
`

export const HEADER_HEIGHT = '50px'

export const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    width: calc(100% - 30px);
    height: ${HEADER_HEIGHT};
    padding: 0 15px;
    border-bottom: 1px solid ${interfaceTheme.color.backgroundLight};
    background-color: ${interfaceTheme.color.background};
    color: ${interfaceTheme.color.highlight1};

    font-size: 0.9rem;
    font-family: 'Roboto Mono', monospace;

    a {
        color: ${interfaceTheme.color.highlight1};
        text-decoration: none;
    }

    overflow-x: auto;

    ${up('md')} {
        overflow-x: hidden;
    }
`

export const ExternalLink = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.2em;

    svg {
        width: 15px;
        stroke: ${interfaceTheme.color.highlight1};
    }
`

export const HeaderButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 30px;

    text-align: center;

    background-color: ${interfaceTheme.color.background};
    &:hover {
        background-color: ${interfaceTheme.color.backgroundLight};
    }

    * {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${interfaceTheme.color.highlight1};
        font-weight: 400;
    }

    button {
        background: none;
        border: none;
        padding: 0;
        width: 35px;
    }

    svg {
        width: 20px;
        height: 20px;
        stroke: #efefef;
    }
`

export const HeaderButtons = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
`

export const HeaderMiddle = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 2em;
`

export const HeaderSandboxTitle = styled.div`
    display: none;

    ${up('md')} {
        display: block;
    }
`

export const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    ${up('md')} {
        height: 100%;
        flex-direction: row;
        overflow: hidden;
    }
`

export const CanvasWrapper = styled.div<{ settingsHidden: boolean }>`
    position: relative;

    flex: 1;
    width: 100%;

    min-height: ${({ settingsHidden }) =>
        settingsHidden ? `calc(100vh - ${HEADER_HEIGHT})` : '70vh'};
    max-height: ${({ settingsHidden }) =>
        settingsHidden ? `calc(100vh - ${HEADER_HEIGHT})` : '70vh'};
    height: 100%;

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

export const SettingsWrapper = styled.div<{ hide: boolean }>`
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

    display: ${({ hide }) => (hide ? 'none' : 'block')};
`
