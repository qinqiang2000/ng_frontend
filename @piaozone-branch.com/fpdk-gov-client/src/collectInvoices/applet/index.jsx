import React from 'react';
import './style.less';
import { pwyFetch } from '@piaozone.com/utils';
import AppletWallet from './appletWallet';
import UnBindApplet from './unBindApplet';
import { Modal, message } from 'antd';
import PropTypes from 'prop-types';

class Applet extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            isPersonal: true,
            oldUserKey: '',
            phone: '',
            openid: ''
        };
    }

    componentDidMount() {
        this.onGetUserInfo();
    }

    getBindStatus = () => { //获取用户绑定二维码的状态
        console.log('判断');
    }

    onGetUserInfo = async() => { //查询用户是否绑定企业（小程序二维码）
        const res = await pwyFetch(this.props.getUserBindInfoUrl, {
            method: 'post'
        });
        if (res.errcode == '0000') {
            if (res.data) {
                const { firstInto = false, isPersonal = false, phone = '', openid } = res.data; //isPersonal true:已绑定
                this.setState({
                    isPersonal,
                    firstInto,
                    phone,
                    openid
                });
                if (firstInto) {
                    Modal.warning({
                        title: '提示',
                        content: '为了避免小程序非公发票采集后自动进入的企业台账，只有主动推送到的发票才会进到企业台账。'
                    });
                }
                if (!isPersonal) {
                    const time2 = setTimeout(() => {
                        this.onGetUserInfo();
                        clearTimeout(time2);
                    }, 5000);
                }
            }
        } else {
            message.info(res.description);
        }
    }

    render() {
        const { isPersonal, phone } = this.state;
        return (
            <div className='appletCont'>
                {
                    !isPersonal ? (
                        <UnBindApplet
                            onGetWxQr={this.props.onGetWxQr}
                        />
                    ) : (
                        <AppletWallet
                            onPrintInvoice={this.props.onPrintInvoice}
                            onQueryInvoiceNums={this.props.onQueryInvoiceNums}
                            onQueryAccount={this.props.onQueryAccount}
                            updateAttachUrl={this.props.updateAttachUrl}
                            queryAttachUrl={this.props.queryAttachUrl}
                            queryTripUrl={this.props.queryTripUrl}
                            onSaveInvoice={this.props.onSaveInvoice}
                            onShowLedgerdata={this.props.onShowLedgerdata}
                            loginInfo={this.props.loginInfo}
                            queryOtherInfoUrl={this.props.queryOtherInfoUrl}
                            queryPushAccountLogsUrl={this.props.queryPushAccountLogsUrl}
                            pushToAccountUrl={this.props.pushToAccountUrl}
                            phone={phone}
                            onGetWxQr={this.props.onGetWxQr}
                            getUserBindInfoUrl={this.props.getUserBindInfoUrl}
                            openid={this.state.openid}
                            onSetOpenId={(data) => this.setState({ openid: data })}
                        />
                    )
                }
            </div>
        );
    }
}

Applet.propTypes = {
    onGetWxQr: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func.isRequired,
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    updateAttachUrl: PropTypes.string,
    queryAttachUrl: PropTypes.string,
    queryTripUrl: PropTypes.string,
    onSaveInvoice: PropTypes.func,
    onShowLedgerdata: PropTypes.func,
    loginInfo: PropTypes.object,
    queryOtherInfoUrl: PropTypes.string,
    queryPushAccountLogsUrl: PropTypes.string,
    pushToAccountUrl: PropTypes.string,
    getUserBindInfoUrl: PropTypes.string
};

export default Applet;