/* eslint-disable header/header */
// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UniqueView, Server} from 'types/config';

import {MattermostServer} from 'common/servers/MattermostServer';

export const TAB_DESKTOP = 'TAB_DESKTOP';
export const TAB_MESSAGING = 'TAB_MESSAGING';
export const TAB_FOCALBOARD = 'TAB_FOCALBOARD';
export const TAB_PLAYBOOKS = 'TAB_PLAYBOOKS';
export type ViewType = typeof TAB_MESSAGING | typeof TAB_FOCALBOARD | typeof TAB_PLAYBOOKS | typeof TAB_DESKTOP;

export interface MattermostView {
    id: string;
    server: MattermostServer;
    isOpen?: boolean;

    get type(): ViewType;
    get url(): URL;
    get shouldNotify(): boolean;

    toUniqueView(): UniqueView;
}

export function getDefaultViewsForConfigServer(server: Server & {order: number; lastActiveView?: number}) {
    return {
        ...server,
        tabs: getDefaultViews(),
    };
}

export function getDefaultViews() {
    return [
        {
            name: TAB_DESKTOP,
            order: 0,
            isOpen: true,
        },
        {
            name: TAB_MESSAGING,
            order: 1,
            isOpen: true,
        },
        {
            name: TAB_FOCALBOARD,
            order: 2,
        },
        {
            name: TAB_PLAYBOOKS,
            order: 3,
        },
    ];
}

export function getViewDisplayName(viewType: ViewType) {
    switch (viewType) {
    case TAB_DESKTOP:
        return 'Desktop';
    case TAB_MESSAGING:
        return 'Chat';
    case TAB_FOCALBOARD:
        return 'Boards';
    case TAB_PLAYBOOKS:
        return 'Playbooks';
    default:
        throw new Error('Not implemeneted');
    }
}

export function canCloseView(viewType: ViewType) {
    return viewType !== TAB_MESSAGING && viewType !== TAB_DESKTOP;
}
