import React from 'react';
import { Button, Input } from 'antd';
import PropTypes from 'prop-types';
import './less/inputConfirmPass.less';

class FpdkGxConfirmPass extends React.Component {
    constructor() {
        super(...arguments);
        this._isMounted = false;
        this.state = {
            loading: false,
            confirmPasswd: ''
        };
    }

    render() {
        const { loading, confirmPasswd } = this.state;
        return (
            <div className='loginArea'>
                <h2>请先输入抵扣统计确认密码！</h2>
                <div className='row'>
                    <label>确认密码：</label>
                    <Input
                        placeholder='抵扣统计确认密码'
                        type='password'
                        value={confirmPasswd}
                        onChange={(e) => this.setState({ confirmPasswd: e.target.value })}
                        autoComplete={false}
                    />
                </div>
                <div className='row' style={{ marginBottom: 15 }}>
                    <label>&nbsp;</label>
                    <Button type='primary' onClick={() => this.props.onConfirm(confirmPasswd)} loading={loading}>勾选确认</Button>
                    <a
                        style={{ marginLeft: 20 }}
                        href='https://tax.piaozone.com/download'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        发票云服务管理程序下载
                    </a>
                </div>
                <p style={{ fontSize: 12, color: '#D47A53' }}>注意：请先下载发票云服务管理程序，启动后，再使用下载发票和勾选认证相关功能！</p>
            </div>
        );
    }
}


FpdkGxConfirmPass.propTypes = {
    onConfirm: PropTypes.func.isRequired
};

export default FpdkGxConfirmPass;