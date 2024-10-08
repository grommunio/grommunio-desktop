/* eslint-disable header/header */
// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.
// See LICENSE.txt for license information.
import {getFormattedPathName} from 'common/utils/url';

import BaseView from './BaseView';
import type {ViewType} from './View';
import {TAB_FILES} from './View';

export default class FilesView extends BaseView {
    get url(): URL {
        return new URL(`${this.server.url.origin}${getFormattedPathName(this.server.url.pathname)}files`);
    }

    get type(): ViewType {
        return TAB_FILES;
    }

    get shouldNotify(): boolean {
        return false;
    }
}
