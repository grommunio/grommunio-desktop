// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// Copyright (c) 2015-2016 Yuya Ochiai

import 'renderer/css/settings.css';

import React from 'react';
import PropTypes from 'prop-types';
import {Col, Grid, Navbar, Row} from 'react-bootstrap';

import {debounce} from 'underscore';

import {GET_LOCAL_CONFIGURATION, UPDATE_CONFIGURATION, SWITCH_SERVER, ADD_SERVER, RELOAD_CONFIGURATION} from 'common/communication';

import TeamList from './TeamList.jsx';
import AutoSaveIndicator from './AutoSaveIndicator.jsx';

const CONFIG_TYPE_SERVERS = 'servers';
const CONFIG_TYPE_APP_OPTIONS = 'appOptions';

function backToIndex(serverName) {
    window.ipcRenderer.send(SWITCH_SERVER, serverName);
    window.close();
}

const settingsPage = {
    navbar: {
        backgroundColor: '#fff',
        position: 'relative',
    },
    close: {
        textDecoration: 'none',
        position: 'absolute',
        right: '0',
        top: '5px',
        fontSize: '35px',
        fontWeight: 'normal',
        color: '#bbb',
    },
    heading: {
        textAlign: 'center',
        fontSize: '24px',
        margin: '0',
        padding: '1em 0',
    },
    sectionHeading: {
        fontSize: '20px',
        margin: '0',
        padding: '1em 0',
        display: 'inline-block',
    },
    sectionHeadingLink: {
        marginTop: '24px',
        display: 'inline-block',
        fontSize: '15px',
    },
    footer: {
        padding: '0.4em 0',
    },
    downloadLocationInput: {
        marginRight: '3px',
        marginTop: '8px',
        width: '320px',
        height: '34px',
        padding: '0 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontWeight: '500',
    },

    downloadLocationButton: {
        marginBottom: '4px',
    },

    container: {
        paddingBottom: '40px',
    },
};

export default class SettingsPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            teams: [],
            showAddTeamForm: false,
            savingState: {
                appOptions: AutoSaveIndicator.SAVING_STATE_DONE,
                servers: AutoSaveIndicator.SAVING_STATE_DONE,
            },
            userOpenedDownloadDialog: false,
        };

        this.getConfig();

        this.saveQueue = [];
    }

    componentDidMount() {
        window.ipcRenderer.on(ADD_SERVER, () => {
            this.setState({
                showAddTeamForm: true,
            });
        });

        window.ipcRenderer.on(RELOAD_CONFIGURATION, () => {
            this.updateSaveState();
            this.getConfig();
        });
    }

    getConfig = () => {
        window.ipcRenderer.invoke(GET_LOCAL_CONFIGURATION).then((config) => {
            this.setState({ready: true, maximized: false, ...this.convertConfigDataToState(config)});
        });
    }

    convertConfigDataToState = (configData, currentState = {}) => {
        const newState = Object.assign({}, configData);
        newState.showAddTeamForm = currentState.showAddTeamForm || false;
        newState.trayWasVisible = currentState.trayWasVisible || false;
        if (newState.teams.length === 0 && currentState.firstRun !== false) {
            newState.firstRun = false;
            newState.showAddTeamForm = true;
        }
        newState.savingState = currentState.savingState || {
            appOptions: AutoSaveIndicator.SAVING_STATE_DONE,
            servers: AutoSaveIndicator.SAVING_STATE_DONE,
        };
        return newState;
    }

    saveSetting = (configType, {key, data}) => {
        this.saveQueue.push({
            configType,
            key,
            data,
        });
        this.updateSaveState();
        this.processSaveQueue();
    }

    processSaveQueue = debounce(() => {
        window.ipcRenderer.send(UPDATE_CONFIGURATION, this.saveQueue.splice(0, this.saveQueue.length));
    }, 500);

    updateSaveState = () => {
        let queuedUpdateCounts = {
            [CONFIG_TYPE_SERVERS]: 0,
            [CONFIG_TYPE_APP_OPTIONS]: 0,
        };

        queuedUpdateCounts = this.saveQueue.reduce((updateCounts, {configType}) => {
            updateCounts[configType]++;
            return updateCounts;
        }, queuedUpdateCounts);

        const savingState = Object.assign({}, this.state.savingState);

        Object.entries(queuedUpdateCounts).forEach(([configType, count]) => {
            if (count > 0) {
                savingState[configType] = AutoSaveIndicator.SAVING_STATE_SAVING;
            } else if (count === 0 && savingState[configType] === AutoSaveIndicator.SAVING_STATE_SAVING) {
                savingState[configType] = AutoSaveIndicator.SAVING_STATE_SAVED;
                this.resetSaveState(configType);
            }
        });

        this.setState({savingState});
    }

    resetSaveState = debounce((configType) => {
        if (this.state.savingState[configType] !== AutoSaveIndicator.SAVING_STATE_SAVING) {
            const savingState = Object.assign({}, this.state.savingState);
            savingState[configType] = AutoSaveIndicator.SAVING_STATE_DONE;
            this.setState({savingState});
        }
    }, 2000);

    handleTeamsChange = (teams) => {
        window.timers.setImmediate(this.saveSetting, CONFIG_TYPE_SERVERS, {key: 'teams', data: teams});
        this.setState({
            showAddTeamForm: false,
            teams,
        });
        if (teams.length === 0) {
            this.setState({showAddTeamForm: true});
        }
    }

    toggleShowTeamForm = () => {
        this.setState({
            showAddTeamForm: !this.state.showAddTeamForm,
        });
        document.activeElement.blur();
    }

    setShowTeamFormVisibility = (val) => {
        this.setState({
            showAddTeamForm: val,
        });
    }

    updateTeam = (index, newData) => {
        const teams = this.state.teams;
        teams[index] = newData;
        window.timers.setImmediate(this.saveSetting, CONFIG_TYPE_SERVERS, {key: 'teams', data: teams});
        this.setState({
            teams,
        });
    }

    addServer = (team) => {
        const teams = this.state.teams;
        teams.push(team);
        window.timers.setImmediate(this.saveSetting, CONFIG_TYPE_SERVERS, {key: 'teams', data: teams});
        this.setState({
            teams,
        });
    }

    openMenu = () => {
        // @eslint-ignore
        this.threeDotMenu.current.blur();
        this.props.openMenu();
    }

    render() {
        const teamsRow = (
            <Row>
                <Col md={12}>
                    <TeamList
                        teams={this.state.teams}
                        showAddTeamForm={this.state.showAddTeamForm}
                        toggleAddTeamForm={this.toggleShowTeamForm}
                        setAddTeamFormVisibility={this.setShowTeamFormVisibility}
                        onTeamsChange={this.handleTeamsChange}
                        updateTeam={this.updateTeam}
                        addServer={this.addServer}
                        allowTeamEdit={this.state.enableServerManagement}
                        onTeamClick={(name) => {
                            backToIndex(name);
                        }}
                    />
                </Col>
            </Row>
        );

        const serversRow = (
            <Row>
                <Col
                    md={10}
                    xs={8}
                >
                    <h2 style={settingsPage.sectionHeading}>{'Server Management'}</h2>
                    <div className='IndicatorContainer'>
                        <AutoSaveIndicator
                            id='serversSaveIndicator'
                            savingState={this.state.savingState.servers}
                            errorMessage={'Can\'t save your changes. Please try again.'}
                        />
                    </div>
                </Col>
                <Col
                    md={2}
                    xs={4}
                >
                    <p className='text-right'>
                        <a
                            style={settingsPage.sectionHeadingLink}
                            id='addNewServer'
                            href='#'
                            onClick={this.toggleShowTeamForm}
                        >{'+ Add New Server'}</a>
                    </p>
                </Col>
            </Row>
        );

        let srvMgmt;
        if (this.state.enableServerManagement === true) {
            srvMgmt = (
                <div>
                    {serversRow}
                    {teamsRow}
                    <hr/>
                </div>
            );
        }

        let waitForIpc;
        if (this.state.ready) {
            waitForIpc = (
                <>
                    {srvMgmt}
                </>
            );
        } else {
            waitForIpc = (<p>{'Loading configuration...'}</p>);
        }

        return (
            <div
                className='container-fluid'
                style={{
                    height: '100%',
                }}
            >
                <div
                    style={{
                        overflowY: 'auto',
                        height: '100%',
                        margin: '0 -15px',
                    }}
                >
                    <Navbar
                        className='navbar-fixed-top'
                        style={settingsPage.navbar}
                    >
                        <div style={{position: 'relative'}}>
                            <h1 style={settingsPage.heading}>{'Servers'}</h1>
                        </div>
                    </Navbar>
                    <Grid
                        className='settingsPage'
                    >
                        {waitForIpc}
                    </Grid>
                </div>
            </div>
        );
    }
}

SettingsPage.propTypes = {
    openMenu: PropTypes.func.isRequired,
};
