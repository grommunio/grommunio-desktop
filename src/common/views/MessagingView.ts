/* eslint-disable header/header */
// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getFormattedPathName} from 'common/utils/url';

import BaseView from './BaseView';
import {ViewType, TAB_MESSAGING} from './View';

export default class MessagingView extends BaseView {
    get url(): URL {
        return new URL(`${this.server.url.origin}${getFormattedPathName(this.server.url.pathname)}chat`);
    }

    get type(): ViewType {
        return TAB_MESSAGING;
    }

    get shouldNotify(): boolean {
        return true;
    }
}
