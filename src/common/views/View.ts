/* eslint-disable header/header */
// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MattermostServer} from 'common/servers/MattermostServer';

import type {UniqueView, Server} from 'types/config';

export const TAB_DESKTOP = 'TAB_DESKTOP';
export const TAB_MESSAGING = 'TAB_MESSAGING';
export const TAB_FILES = 'TAB_FILES';
export const TAB_MEET = 'TAB_MEET';
export type ViewType = typeof TAB_DESKTOP |
                        typeof TAB_MESSAGING |
                        typeof TAB_FILES |
                        typeof TAB_MEET;

const grommunioTabs = [
    TAB_DESKTOP,
    TAB_MESSAGING,
    TAB_FILES,
    TAB_MEET,
];

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
        },
        {
            name: TAB_FILES,
            order: 2,
        },
        {
            name: TAB_MEET,
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
    case TAB_FILES:
        return 'Files';
    case TAB_MEET:
        return 'Meet';
    default:
        return undefined;
    }
}

export function canCloseView(viewType: ViewType) {
    return !grommunioTabs.includes(viewType);
}
