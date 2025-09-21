import React from 'react';
import { Modal } from 'antd';
import styles from './selectSourcePanel.css';

class ModalTemplate extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            isVisible: true
        };
    }
    submitSource = () => {
        const { index } = this.state;
        const source = this.props.sources[index];
        typeof this.props.onOk === 'function' && this.props.onOk(source, index);
        this.onModalCancel();
    };
    selectSource = (index) => {
        this.setState({ index });
    };
    onModalCancel = () => {
        this.setState({ isVisible: false });
        // typeof this.props.onHide === 'function' && this.props.onHide();
    };
    render() {
        const { sources } = this.props;
        const { index, isVisible } = this.state;
        return (
            <>
                <Modal
                    destroyOnClose
                    closable={false}
                    visible={isVisible}
                    class='rz-scanner-modal'
                    width={300}
                    onCancel={this.onModalCancel}
                    onOk={() => this.submitSource()}
                >
                    <h4>选择扫描来源:</h4>
                    <ul className={styles.ul}>
                        {sources.map((itm, idx) => {
                            return (
                                <li
                                    className={`${styles.li} ${index == idx ? styles.active : ''}`}
                                    onClick={() => this.selectSource(idx)}
                                    key={itm}
                                    value={itm}
                                >
                                    {itm}
                                </li>
                            );
                        })}
                    </ul>
                </Modal>
            </>
        );
    }
}

export default ModalTemplate;
