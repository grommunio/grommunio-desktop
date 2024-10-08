// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal, Button, FormGroup, FormControl, FormLabel, FormText, Spinner} from 'react-bootstrap';
import type {IntlShape} from 'react-intl';
import {FormattedMessage, injectIntl} from 'react-intl';

import {URLValidationStatus} from 'common/utils/constants';

import type {UniqueServer} from 'types/config';
import type {URLValidationResult} from 'types/server';

import 'renderer/css/components/NewServerModal.scss';

type Props = {
    onClose?: () => void;
    onSave?: (server: UniqueServer) => void;
    server?: UniqueServer;
    editMode?: boolean;
    show?: boolean;
    restoreFocus?: boolean;
    currentOrder?: number;
    setInputRef?: (inputRef: HTMLInputElement) => void;
    intl: IntlShape;
};

type State = {
    serverName: string;
    serverUrl: string;
    serverServiceTabs: boolean;
    serverId?: string;
    serverOrder: number;
    saveStarted: boolean;
    validationStarted: boolean;
    validationResult?: URLValidationResult;
}

class NewServerModal extends React.PureComponent<Props, State> {
    wasShown?: boolean;
    serverUrlInputRef?: HTMLInputElement;
    validationTimeout?: NodeJS.Timeout;
    mounted: boolean;

    static defaultProps = {
        restoreFocus: true,
    };

    constructor(props: Props) {
        super(props);

        this.wasShown = false;
        this.mounted = false;
        this.state = {
            serverName: '',
            serverUrl: '',
            serverServiceTabs: true,
            serverOrder: props.currentOrder || 0,
            saveStarted: false,
            validationStarted: false,
        };
    }

    componentDidMount(): void {
        this.mounted = true;
    }

    componentWillUnmount(): void {
        this.mounted = false;
    }

    initializeOnShow = () => {
        this.setState({
            serverName: this.props.server ? this.props.server.name : '',
            serverUrl: this.props.server ? this.props.server.url : '',
            serverServiceTabs: this.props.server ? this.props.server.serviceTabs : true,
            serverId: this.props.server?.id,
            saveStarted: false,
            validationStarted: false,
            validationResult: undefined,
        });

        if (this.props.editMode && this.props.server) {
            this.validateServerURL(this.props.server.url);
        }
    };

    handleServerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            serverName: e.target.value,
        });
    };

    handleServerServiceTabsChange = () => {
        this.setState({
            serverServiceTabs: !this.state.serverServiceTabs,
        });
    };

    // when focus on name, check if url is valid
    handleServerNameFocus = () => {
        this.validateServerURL(this.state.serverUrl);
    };

    handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const serverUrl = e.target.value;
        this.setState({serverUrl, validationResult: undefined});
    };

    validateServerURL = (serverUrl: string) => {
        clearTimeout(this.validationTimeout as unknown as number);
        this.validationTimeout = setTimeout(() => {
            if (!this.mounted) {
                return;
            }
            const currentTimeout = this.validationTimeout;
            this.setState({validationStarted: true});
            window.desktop.validateServerURL(serverUrl, this.props.server?.id).then((validationResult) => {
                if (!this.mounted) {
                    return;
                }
                if (currentTimeout !== this.validationTimeout) {
                    return;
                }
                this.setState({validationResult, validationStarted: false, serverUrl: validationResult.validatedURL ?? serverUrl, serverName: this.state.serverName ? this.state.serverName : validationResult.serverName ?? ''});
            });
        }, 1000);
    };

    isServerURLErrored = () => {
        return this.state.validationResult?.status === URLValidationStatus.Invalid ||
            this.state.validationResult?.status === URLValidationStatus.Missing;
    };

    getServerURLMessage = () => {
        if (this.state.validationStarted) {
            return (
                <div>
                    <Spinner
                        className='NewServerModal-validationSpinner'
                        animation='border'
                        size='sm'
                    />
                    <FormattedMessage
                        id='renderer.components.newServerModal.validating'
                        defaultMessage='Validating...'
                    />
                </div>
            );
        }

        if (!this.state.validationResult) {
            return null;
        }

        switch (this.state.validationResult?.status) {
        case URLValidationStatus.Missing:
            return (
                <div
                    id='urlValidation'
                    className='error'
                >
                    <i className='icon-close-circle'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.error.urlRequired'
                        defaultMessage='URL is required.'
                    />
                </div>
            );
        case URLValidationStatus.Invalid:
            return (
                <div
                    id='urlValidation'
                    className='error'
                >
                    <i className='icon-close-circle'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.error.urlIncorrectFormatting'
                        defaultMessage='URL is not formatted correctly.'
                    />
                </div>
            );
        case URLValidationStatus.URLExists:
            return (
                <div
                    id='urlValidation'
                    className='warning'
                >
                    <i className='icon-alert-outline'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.error.serverUrlExists'
                        defaultMessage='A server named {serverName} with the same Site URL already exists.'
                        values={{serverName: this.state.validationResult.existingServerName}}
                    />
                </div>
            );
        case URLValidationStatus.Insecure:
            return (
                <div
                    id='urlValidation'
                    className='warning'
                >
                    <i className='icon-alert-outline'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.warning.insecure'
                        defaultMessage='Your server URL is potentially insecure. For best results, use a URL with the HTTPS protocol.'
                    />
                </div>
            );
        case URLValidationStatus.NotMattermost:
            return (
                <div
                    id='urlValidation'
                    className='warning'
                >
                    <i className='icon-alert-outline'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.warning.notMattermost'
                        defaultMessage='The server URL provided does not appear to point to a valid grommunio server. Please verify the URL and check your connection.'
                    />
                </div>
            );
        case URLValidationStatus.URLNotMatched:
            return (
                <div
                    id='urlValidation'
                    className='warning'
                >
                    <i className='icon-alert-outline'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.warning.urlNotMatched'
                        defaultMessage='The server URL does not match the configured Site URL on your grommunio server. Server version: {serverVersion}'
                        values={{serverVersion: this.state.validationResult.serverVersion}}
                    />
                </div>
            );
        case URLValidationStatus.URLUpdated:
            return (
                <div
                    id='urlValidation'
                    className='info'
                >
                    <i className='icon-information-outline'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.warning.urlUpdated'
                        defaultMessage='The server URL provided has been updated to match the configured Site URL on your grommunio server. Server version: {serverVersion}'
                        values={{serverVersion: this.state.validationResult.serverVersion}}
                    />
                </div>
            );
        }

        return (
            <div
                id='urlValidation'
                className='success'
            >
                <i className='icon-check-circle'/>
                <FormattedMessage
                    id='renderer.components.newServerModal.success.ok'
                    defaultMessage='Server URL is valid. Server version: {serverVersion}'
                    values={{serverVersion: this.state.validationResult.serverVersion}}
                />
            </div>
        );
    };

    getServerNameMessage = () => {
        if (!this.state.serverName.length) {
            return (
                <div
                    id='nameValidation'
                    className='error'
                >
                    <i className='icon-close-circle'/>
                    <FormattedMessage
                        id='renderer.components.newServerModal.error.nameRequired'
                        defaultMessage='Name is required.'
                    />
                </div>
            );
        }
        return null;
    };

    save = () => {
        if (!this.state.validationResult) {
            return;
        }

        if (this.isServerURLErrored()) {
            return;
        }

        this.setState({
            saveStarted: true,
        }, () => {
            this.props.onSave?.({
                url: this.state.serverUrl,
                name: this.state.serverName,
                serviceTabs: this.state.serverServiceTabs,
                id: this.state.serverId,
            });
        });
    };

    getSaveButtonLabel() {
        if (this.props.editMode) {
            return (
                <FormattedMessage
                    id='label.save'
                    defaultMessage='Save'
                />
            );
        }
        return (
            <FormattedMessage
                id='label.add'
                defaultMessage='Add'
            />
        );
    }

    getModalTitle() {
        if (this.props.editMode) {
            return (
                <FormattedMessage
                    id='renderer.components.newServerModal.title.edit'
                    defaultMessage='Edit Server'
                />
            );
        }
        return (
            <FormattedMessage
                id='renderer.components.newServerModal.title.add'
                defaultMessage='Add Server'
            />
        );
    }

    render() {
        if (this.wasShown !== this.props.show && this.props.show) {
            this.initializeOnShow();
        }
        this.wasShown = this.props.show;

        return (
            <Modal
                bsClass='modal'
                className='NewServerModal'
                show={this.props.show}
                id='newServerModal'
                enforceFocus={true}
                onEntered={() => this.serverUrlInputRef?.focus()}
                onHide={this.props.onClose}
                restoreFocus={this.props.restoreFocus}
                onKeyDown={(e: React.KeyboardEvent) => {
                    switch (e.key) {
                    case 'Enter':
                        this.save();

                        // The add button from behind this might still be focused
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case 'Escape':
                        this.props.onClose?.();
                        break;
                    }
                }}
            >
                <Modal.Header>
                    <Modal.Title>{this.getModalTitle()}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <form>
                        <FormGroup>
                            <FormLabel>
                                <FormattedMessage
                                    id='renderer.components.newServerModal.serverURL'
                                    defaultMessage='Server URL'
                                />
                            </FormLabel>
                            <FormControl
                                id='serverUrlInput'
                                type='text'
                                value={this.state.serverUrl}
                                placeholder='https://example.com'
                                onChange={this.handleServerUrlChange}
                                onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                                    e.stopPropagation();
                                }}
                                ref={(ref: HTMLInputElement) => {
                                    this.serverUrlInputRef = ref;
                                    if (this.props.setInputRef) {
                                        this.props.setInputRef(ref);
                                    }
                                }}
                                isInvalid={this.isServerURLErrored()}
                                autoFocus={true}
                            />
                            <FormControl.Feedback/>
                            <FormText>
                                <FormattedMessage
                                    id='renderer.components.newServerModal.serverURL.description'
                                    defaultMessage='The URL of your grommunio server. Must start with http:// or https://.'
                                />
                            </FormText>
                        </FormGroup>
                        <FormGroup className='NewServerModal-noBottomSpace'>
                            <FormLabel>
                                <FormattedMessage
                                    id='renderer.components.newServerModal.serverDisplayName'
                                    defaultMessage='Server Display Name'
                                />
                            </FormLabel>
                            <FormControl
                                id='serverNameInput'
                                type='text'
                                value={this.state.serverName}
                                placeholder={this.props.intl.formatMessage({id: 'renderer.components.newServerModal.serverDisplayName', defaultMessage: 'Server Display Name'})}
                                onChange={this.handleServerNameChange}
                                onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                                    e.stopPropagation();
                                }}
                                onFocus={this.handleServerNameFocus}
                                isInvalid={!this.state.serverName.length}
                            />
                            <FormControl.Feedback/>
                            <FormText className='NewServerModal-noBottomSpace'>
                                <FormattedMessage
                                    id='renderer.components.newServerModal.serverDisplayName.description'
                                    defaultMessage='The name of the server displayed on your desktop app tab bar.'
                                />
                            </FormText>
                            <p
                                style={{
                                    color: 'rgba(var(--center-channel-color-rgb), 0.56)',
                                    marginTop: 22,
                                    fontFamily: 'Metropolis',
                                    fontSize: '14px',
                                    fontStyle: 'normal',
                                    lineHeight: '20px',
                                }}
                            >
                                <input
                                    type='checkbox'
                                    style={{
                                        marginRight: 10,
                                        marginTop: 1,
                                    }}
                                    checked={this.state.serverServiceTabs}
                                    onChange={this.handleServerServiceTabsChange}
                                />
                                <FormattedMessage
                                    id='renderer.components.configureServer.serviceTabs.info'
                                    defaultMessage='Show other service tabs'
                                />
                            </p>
                        </FormGroup>
                    </form>
                    <div
                        className='NewServerModal-validation'
                    >
                        {this.getServerNameMessage()}
                        {this.getServerURLMessage()}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {this.props.onClose &&
                        <Button
                            id='cancelNewServerModal'
                            onClick={this.props.onClose}
                            variant='link'
                        >
                            <FormattedMessage
                                id='label.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    }
                    {this.props.onSave &&
                        <Button
                            id='saveNewServerModal'
                            onClick={this.save}
                            disabled={!this.state.serverName.length || !this.state.validationResult || this.isServerURLErrored()}
                            variant='primary'
                        >
                            {this.getSaveButtonLabel()}
                        </Button>
                    }
                </Modal.Footer>

            </Modal>
        );
    }
}

export default injectIntl(NewServerModal);
