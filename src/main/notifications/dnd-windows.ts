// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getFocusAssist, isPriority} from 'windows-focus-assist';

/**
    -2: NOT_SUPPORTED,
    -1: FAILED,
    0: Off,
    1: PRIORITY_ONLY,
    2: ALARMS_ONLY
*/
function getWindowsDoNotDisturb() {
    if (process.platform !== 'win32') {
        return false;
    }

    const focusAssistValue = getFocusAssist().value;
    switch (focusAssistValue) {
    case 2:
        return true;
    case 1:
        return !isPriority('grommunio.Desktop');
    case 0:
    case -1:
    case -2:
        return false;
    default:
        return focusAssistValue;
    }
}

export default getWindowsDoNotDisturb;
