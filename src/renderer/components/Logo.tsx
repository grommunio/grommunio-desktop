// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import logo from 'static/icon.png';

type Props = {
    width?: number;
    height?: number;
}

export default ({
    width = 100,
    height = 100,
}: Props) => (
    <img
        src={logo}
        width={width}
        height={height}
    />
);
