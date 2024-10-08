// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import IntlProvider from 'renderer/intl_provider';

import type {UniqueServer} from 'types/config';

import ConfigureServer from '../../components/ConfigureServer';

import 'bootstrap/dist/css/bootstrap.min.css';

const MOBILE_SCREEN_WIDTH = 1200;

const onConnect = (data: UniqueServer) => {
    window.desktop.modals.finishModal(data);
};

const WelcomeScreenModalWrapper = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileView, setMobileView] = useState(false);

    const handleWindowResize = () => {
        setMobileView(window.innerWidth < MOBILE_SCREEN_WIDTH);
    };

    useEffect(() => {
        window.desktop.getDarkMode().then((result) => {
            setDarkMode(result);
        });

        window.desktop.onDarkModeChange((result) => {
            setDarkMode(result);
        });

        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <IntlProvider>
            <ConfigureServer
                mobileView={mobileView}
                darkMode={darkMode}
                onConnect={onConnect}
            />
        </IntlProvider>
    );
};

const start = () => {
    ReactDOM.render(
        <WelcomeScreenModalWrapper/>,
        document.getElementById('app'),
    );
};

start();
