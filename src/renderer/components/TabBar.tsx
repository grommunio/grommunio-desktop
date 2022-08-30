// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Nav} from 'react-bootstrap';
import {DragDropContext, DraggingStyle, Droppable, DropResult, NotDraggingStyle} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {Tab} from 'types/config';

type Props = {
    activeTabName?: string;
    activeServerName?: string;
    id: string;
    isDarkMode: boolean;
    onSelect: (name: string, index: number) => void;
    onCloseTab: (name: string) => void;
    tabs: Tab[];
    sessionsExpired: Record<string, boolean>;
    unreadCounts: Record<string, number>;
    mentionCounts: Record<string, number>;
    onDrop: (result: DropResult) => void;
    tabsDisabled?: boolean;
    isMenuOpen?: boolean;
};

function getStyle(style?: DraggingStyle | NotDraggingStyle) {
    if (style?.transform) {
        const axisLockX = `${style.transform.slice(0, style.transform.indexOf(','))}, 0px)`;
        return {
            ...style,
            transform: axisLockX,
        };
    }
    return style;
}

export default class TabBar extends React.PureComponent<Props> {
    onCloseTab = (name: string) => {
        return (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            this.props.onCloseTab(name);
        };
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.props.onDrop}>
                <Droppable
                    isDropDisabled={this.props.tabsDisabled}
                    droppableId='tabBar'
                    direction='horizontal'
                >
                    {(provided) => (
                        <Nav
                            ref={provided.innerRef}
                            className={classNames('TabBar', {
                                darkMode: this.props.isDarkMode,
                            })}
                            id={this.props.id}
                            variant='tabs'
                            {...provided.droppableProps}
                        >
                            {this.props.isMenuOpen ? <span className='TabBar-nonDrag'/> : null}
                            {provided.placeholder}
                        </Nav>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}
