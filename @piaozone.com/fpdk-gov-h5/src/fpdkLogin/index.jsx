import React from 'react';
import { message, Button, Input } from 'antd';
import PropTypes from 'prop-types';
import './style.less';

class FpdkLogin extends React.Component {
    constructor() {
        super(...arguments);
        this._isMounted = false;
        this.state = {
            loading: false,
            passwd: '',
            ptPasswd: ''
        };
    }

    onLoginGov = () => {
        this.setState({
            loading: true
        });

        this.props.govOperate.login(this.state.passwd, this.state.ptPasswd, this.props.access_token).then((res) => {
            message.destroy();
            this.setState({
                loading: false
            });
            if (res.errcode === '0000') {
                this.props.onLogin(res);
            } else {
                message.info(res.description);
            }
        });
    }

    render() {
        const { passwd, ptPasswd, loading } = this.state;
        return (
            <div className='loginArea'>
                <h2>请先税盘登录再操作！</h2>
                <div className='row'>
                    <div style={{ position: 'relative', width: 0, height: 0, overflow: 'hidden' }}>
                        <input type='text' style={{ position: 'absolute', left: -1000 }} />
                        <input type='password' style={{ position: 'absolute', left: -1000 }} />
                    </div>
                    <label>税盘密码：</label>
                    <Input
                        type='password'
                        placeholder='税盘CA密码'
                        value={passwd}
                        onChange={(e) => this.setState({ passwd: e.target.value })}
                        autoComplete={false}
                    />
                </div>
                <div className='row'>
                    <label>平台密码：</label>
                    <Input
                        placeholder='抵扣平台密码'
                        value={ptPasswd}
                        onChange={(e) => this.setState({ ptPasswd: e.target.value })}
                        autoComplete={false}
                    />
                </div>
                <div className='row' style={{ marginBottom: 15 }}>
                    <label>&nbsp;</label>
                    <Button type='primary' onClick={this.onLoginGov} loading={loading}>税盘登录</Button>
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

FpdkLogin.propTypes = {
    onLogin: PropTypes.func.isRequired,
    govOperate: PropTypes.object.isRequired,
    access_token: PropTypes.string
};

export default FpdkLogin;