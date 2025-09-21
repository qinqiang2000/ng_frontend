import React from 'react';
import { Tabs, message, Modal } from 'antd';
import './style.css';
import DkgxInvoices from './components/dkgxInvoices/';
import BdkgxInvoices from './components/bdkgxInvoices/';
import TrafficDkInvoices from './components/trafficDkInvoices/';
import GxConfirm from './components/dktjInvoices/';
import PropTypes from 'prop-types';
import { govFpdkOperate } from '@piaozone.com/swjgFpdkV4';
import { kdRequest } from '@piaozone.com/utils';
import FpdkLogin from '@piaozone.com/fpdk-login';
import GxLogs from './components/gxLogs/';

const { TabPane } = Tabs;

class GxInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        const { diskInfoArr = [], diskInfoIndex = 0, firstLoginUrl, secondLoginUrl, collectUrl, fpdkType } = props;
        const diskInfo = diskInfoArr[diskInfoIndex] || {};
        this.govOperate = govFpdkOperate.getInstanceByTaxNo({
            firstLoginUrl,
            secondLoginUrl,
            collectUrl,
            taxNo: diskInfo.taxNo,
            operateUrl: diskInfo.operateUrl,
            fpdkType
        });

        this.state = {
            activeKey: '1',
            loginGovInfo: this.govOperate.loginGovInfo,
            showLoginDialog: false
        };
    }

    componentDidMount() {
        const { periodQueryUrl, fpdkType } = this.props;
        if (periodQueryUrl && fpdkType === 2) {
            kdRequest({
                url: periodQueryUrl,
                data: {},
                method: 'POST'
            }).then((res) => {
                if (res.errcode === '0000') {
                    this.setState({
                        skssq: res.data.skssq,
                        taxPeriod: res.data.taxPeriod
                    });
                    return;
                }
                message.info(res.description);
            });
        }
    }

    onShowLogin = () => {
        this.setState({
            showLoginDialog: true
        });
    }

    onLogin = (res) => {
        this.setState({
            showLoginDialog: false,
            loginGovInfo: res.data
        });
    }

    onChangeTab = (v) => {
        this.setState({
            activeKey: v
        });
    }

    render() {
        let defaultCls = ['inputDkAccount'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const style = this.props.style || {};
        const { showLoginDialog, loginGovInfo, taxPeriod, skssq, activeKey } = this.state;
        const {
            dkgxUrl, bdkgxUrl, gxConfirmUrl, searchTjUrl,
            qxtjUrl, sctjUrl, dkgxSearchUrl, access_token,
            collectUrl, fpdkType, clientType = 1, queryNumUrl,
            pageSizeOptions = [], API_PRE_PATH, taxNo
        } = this.props;
        return (
            <div className={defaultCls.join(' ')} style={style}>
                {
                    clientType == 1 ? (
                        <Tabs activeKey={activeKey} onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                            <TabPane tab='旅客运输抵扣' key='1'>
                                <TrafficDkInvoices
                                    access_token={access_token}
                                    queryNumUrl={queryNumUrl}
                                    exportUrl={this.props.exportUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                    onDkInvoice={this.props.onDkInvoice}
                                    onCancelDkInvoice={this.props.onCancelDkInvoice}
                                    pageSizeOptions={pageSizeOptions}
                                    getRelateBillInfo={this.props.getRelateBillInfo}
                                />
                            </TabPane>
                        </Tabs>
                    ) : (
                        <Tabs activeKey={activeKey} onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                            <TabPane tab='抵扣勾选' key='1'>
                                <DkgxInvoices
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    access_token={access_token}
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    dkgxUrl={dkgxUrl}
                                    queryNumUrl={queryNumUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    clientType={clientType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    exportUrl={this.props.exportUrl}
                                    dkgxAllUrl={this.props.dkgxAllUrl}
                                    getSingleAccountUrl={this.props.getSingleAccountUrl}
                                    singleExportUrl={this.props.singleExportUrl}
                                    dkgxProgressUrl={this.props.dkgxProgressUrl}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                    getRelateBillInfo={this.props.getRelateBillInfo}
                                    govExportUrl={this.props.govExportUrl}
                                    eleExportUrl={this.props.eleExportUrl}
                                />
                            </TabPane>
                            <TabPane tab='不抵扣勾选' key='2'>
                                <BdkgxInvoices
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    access_token={access_token}
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    exportUrl={this.props.exportUrl}
                                    bdkgxUrl={bdkgxUrl}
                                    queryNumUrl={queryNumUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                    getRelateBillInfo={this.props.getRelateBillInfo}
                                />
                            </TabPane>
                            <TabPane tab='旅客运输抵扣' key='3'>
                                <TrafficDkInvoices
                                    access_token={access_token}
                                    queryNumUrl={queryNumUrl}
                                    exportUrl={this.props.exportUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                    onDkInvoice={this.props.onDkInvoice}
                                    getRelateBillInfo={this.props.getRelateBillInfo}
                                />
                            </TabPane>
                            <TabPane tab='抵扣统计' key='4'>
                                <GxConfirm
                                    skssq={skssq}
                                    collectUrl={collectUrl}
                                    access_token={access_token}
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    gxConfirmUrl={gxConfirmUrl}
                                    searchTjUrl={searchTjUrl}
                                    qxtjUrl={qxtjUrl}
                                    sctjUrl={sctjUrl}
                                    fpdkType={fpdkType}
                                    clientType={clientType}
                                />
                            </TabPane>
                        </Tabs>
                    )
                }
                <Modal
                    visible={showLoginDialog}
                    onCancel={() => this.setState({ showLoginDialog: false })}
                    footer={null}
                    destroyOnClose={true}
                >
                    <FpdkLogin
                        taxNo={taxNo}
                        showLogin={this.onShowLogin}
                        API_PRE_PATH={API_PRE_PATH}
                        onLogin={this.onLogin}
                        govOperate={this.govOperate}
                        access_token={access_token}
                    />
                </Modal>
            </div>
        );
    }
}

GxInvoices.propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    diskInfoArr: PropTypes.array,
    access_token: PropTypes.string,
    diskInfoIndex: PropTypes.number,
    pageSizeOptions: PropTypes.array,
    firstLoginUrl: PropTypes.string.isRequired,
    secondLoginUrl: PropTypes.string.isRequired,
    dkgxSearchUrl: PropTypes.string.isRequired,
    collectUrl: PropTypes.string.isRequired,
    dkgxUrl: PropTypes.string.isRequired,
    bdkgxUrl: PropTypes.string.isRequired,
    gxConfirmUrl: PropTypes.string.isRequired,
    searchTjUrl: PropTypes.string.isRequired,
    qxtjUrl: PropTypes.string.isRequired,
    sctjUrl: PropTypes.string.isRequired,
    exportUrl: PropTypes.string,
    govExportUrl: PropTypes.string,
    eleExportUrl: PropTypes.string,
    fpdkType: PropTypes.number,
    periodQueryUrl: PropTypes.string,
    clientType: PropTypes.string,
    isEntryVoucher: PropTypes.number,
    dkgxAllUrl: PropTypes.string,
    onCancelDkInvoice: PropTypes.string,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired,
    queryNumUrl: PropTypes.string,
    onDkInvoice: PropTypes.func,
    getRelateBillInfo: PropTypes.func,
    taxNo: PropTypes.string,
    API_PRE_PATH: PropTypes.string
};


export {
    GxInvoices,
    GxLogs
};