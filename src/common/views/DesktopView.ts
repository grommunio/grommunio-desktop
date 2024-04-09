/* eslint-disable header/header */
// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.
// See LICENSE.txt for license information.

import BaseView from './BaseView';
import {ViewType, TAB_DESKTOP} from './View';

export default class DesktopView extends BaseView {
    get url(): URL {
        return new URL('https://mail.grommunio.com');
    }

    get type(): ViewType {
        return TAB_DESKTOP;
    }

    get shouldNotify(): boolean {
        return true;
    }
}
