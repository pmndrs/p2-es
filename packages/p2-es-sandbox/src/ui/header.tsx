import React from 'react'
import { styled } from 'styled-components'
import { up } from './styled-components'
import { CodeSvg, ExternalLinkSvg, PencilSvg, RefreshSvg } from './svgs'
import { interfaceTheme } from './theme'

const HEADER_HEIGHT = '50px'

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    width: calc(100% - 30px);
    min-height: ${HEADER_HEIGHT};
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

const ExternalLink = styled.div`
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

const HeaderButton = styled.div`
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

const HeaderButtons = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
`

const HeaderMiddle = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 2em;
`

const HeaderSandboxTitle = styled.div`
    display: none;

    ${up('md')} {
        display: block;
    }
`

export type HeaderProps = {
    title?: string
    codeLink?: string
    sceneNames: string[]
    scene: string
    resetScene: () => void
    toggleShowSceneControls: () => void
}

export const Header = ({ title, codeLink, sceneNames, scene, resetScene, toggleShowSceneControls }: HeaderProps) => (
    <HeaderContainer>
        <a href="https://p2-es.pmnd.rs" target="_blank">
            <ExternalLink>
                p2-es
                <ExternalLinkSvg />
            </ExternalLink>
        </a>

        <HeaderMiddle>
            <HeaderSandboxTitle>
                {title}
                {title && sceneNames.length > 1 ? ' - ' : ''}
                {scene !== 'default' ? scene : ''}
            </HeaderSandboxTitle>

            <HeaderButtons>
                <HeaderButton title="Reset">
                    <button onClick={() => resetScene()}>
                        <RefreshSvg />
                    </button>
                </HeaderButton>

                <HeaderButton title="Settings">
                    <button onClick={() => toggleShowSceneControls()}>
                        <PencilSvg />
                    </button>
                </HeaderButton>

                {codeLink !== undefined ? (
                    <HeaderButton title="Sandbox Source Code">
                        <a href={codeLink} target="_blank">
                            <CodeSvg />
                        </a>
                    </HeaderButton>
                ) : null}
            </HeaderButtons>
        </HeaderMiddle>

        <a href="https://p2-es.pmnd.rs/docs" target="_blank">
            <ExternalLink>
                docs
                <ExternalLinkSvg />
            </ExternalLink>
        </a>
    </HeaderContainer>
)
