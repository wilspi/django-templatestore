import React, { Component } from 'react';
import Modal from 'react-modal';
import styles from './alertModal.less';
import PropTypes from 'prop-types';

class AlertModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    className={styles.modal}
                    onRequestClose={this.props.onClose}
                    appElement={document.getElementById('te-app')}
                >
                    <span className={styles.close} onClick={this.props.onClose}>&times;</span>
                    <p>{this.props.errorMessage}</p>
                </Modal>
            </div>
        );
    }
}

AlertModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    errorMessage: PropTypes.string
};

export default AlertModal;
