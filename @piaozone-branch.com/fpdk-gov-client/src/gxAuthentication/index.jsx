import React from 'react';
import { Tabs, Modal, message, Button } from 'antd';
import './less/style.less';
import DkgxInvoices from './dkgx';
import BdkgxInvoices from './bdkgx';
import CustomsDkgx from './customsDkgx';
import CustomsBdkgx from './customsBdkgx';
import GxConfirm from './gxConfirm';
import GxLogs from './gxLogs';
import PropTypes from 'prop-types';
import { kdRequest } from '@piaozone.com/utils';
import ChooseAccount from '../commons/chooseAccount';

const { TabPane } = Tabs;

class GxInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activeTab: '1',
            taxTickPlatform: '',
            loginType: '',
            inputPathUrl: '',
            unConfigClient: false,
            autoRefresh: false,
            showAccount: false
        };
    }

    getThirdConfig = () => {
        return new Promise((resolve) => {
            const { verifyConfigUrl } = this.props;
            kdRequest({
                url: verifyConfigUrl,
                data: {
                    revenueNumber: this.props.taxNo
                },
                method: 'POST'
            }).then((res) => {
                if (res.errcode != '0000') {
                    resolve(res);
                }
                if (res.data && res.data.length > 0) {
                    const { taxTickPlatform, loginType, inputPathUrl } = res.data[0];
                    this.setState({
                        taxTickPlatform,
                        loginType,
                        inputPathUrl
                    });
                    resolve({ errcode: '0000', data: { taxTickPlatform, loginType, inputPathUrl } });
                } else {
                    resolve({ errcode: 'fail', data: [] });
                }
            });
        });
    }

    componentDidMount = async() => {
        const result = await this.getThirdConfig();
        if (result.errcode != '0000') {
            this.setState({
                unConfigClient: true
            });
            return;
        }
        this.onGetSkssq(result.data);
    }

    onGetSkssq = (opt) => { //获取税期
        const { periodQueryUrl } = this.props;
        kdRequest({
            url: periodQueryUrl,
            data: opt,
            method: 'POST'
        }).then((res) => {
            if (res.errcode === 'loginFail') {
                this.props.onClientLogin(res.data.loginWebUrl, 'gxInvoices');
                return;
            }
            if (res.errcode === '91300') {
                Modal.warning({
                    title: '温馨提示',
                    content: res.description + '请重试',
                    onOk: () => {
                        this.onGetSkssq();
                    }
                });
                return;
            } else if (res.errcode === '90500') {
                Modal.warning({
                    title: '温馨提示',
                    content: res.description
                });
                return;
            }
            if (res.errcode === '0000') {
                this.setState({
                    skssq: res.data.skssq,
                    gxrqfw: res.data.gxrqfw,
                    taxPeriod: res.data.taxPeriod
                });
                return;
            } else {
                this.setState({
                    skssq: '',
                    gxrqfw: '',
                    taxPeriod: ''
                });
            }
            message.info(res.description, 3);
        });
    }

    openGxLog = () => {
        this.setState({
            autoRefresh: true,
            activeTab: '6'
        });
    }

    closeModal = () => {
        this.setState({
            showAccount: false
        });
    }

    handleChooseOk = (value) => {
        const { handleAccount } = this.props;
        handleAccount && handleAccount(value);
        this.closeModal();
    }

    showChooseModal = () => {
        this.setState({
            showAccount: true
        });
    }

    render() {
        const { taxPeriod, skssq, gxrqfw, unConfigClient, taxTickPlatform, loginType, inputPathUrl, activeTab, showAccount } = this.state;
        const {
            dkgxUrl, bdkgxUrl, gxConfirmUrl, searchTjUrl,
            qxtjUrl, sctjUrl, dkgxSearchUrl, access_token,
            collectUrl, clientType = 1,
            userSource, accountList = [], isShowAccount
        } = this.props; //taxNo, API_PRE_PATH
        const defaultAccount = accountList.length === 1 ? accountList[0] : accountList.filter(item => item.selected)[0] || {};

        return (
            <div>
                <Tabs
                    activeKey={activeTab}
                    onChange={(e) => { this.setState({ activeTab: e }); }}
                    animated={false}
                    style={{ marginBottom: 15 }}
                    className='pwyTabs'
                >
                    <TabPane tab='增值税抵扣勾选' key='1'>
                        <DkgxInvoices
                            taxPeriod={taxPeriod}
                            skssq={skssq}
                            gxrqfw={gxrqfw}
                            access_token={access_token}
                            showLogin={this.onShowLogin}
                            dkgxUrl={dkgxUrl}
                            gxExportUrl={this.props.gxExportUrl}
                            gxImportUrl={this.props.gxImportUrl}
                            dkgxSearchUrl={dkgxSearchUrl}
                            rpaGxLogUrl={this.props.rpaGxLogUrl}
                            clientType={clientType}
                            isEntryVoucher={this.props.isEntryVoucher}
                            exportUrl={this.props.exportUrl}
                            dkgxAllUrl={this.props.dkgxAllUrl}
                            getSingleAccountUrl={this.props.getSingleAccountUrl}
                            singleExportUrl={this.props.singleExportUrl}
                            dkgxProgressUrl={this.props.dkgxProgressUrl}
                            shrSourceUrl={this.props.shrSourceUrl}
                            getAuthCodeUrl={this.props.getAuthCodeUrl}
                            excelParamUrl={this.props.excelParamUrl}
                            getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                            gitReviewerUrl={this.props.gitReviewerUrl}
                            clientConfig={{
                                taxTickPlatform,
                                loginType,
                                inputPathUrl
                            }}
                            onClientLogin={this.props.onClientLogin}
                            userSource={userSource}
                            onOpenGxLog={this.openGxLog}
                            displayCls={this.props.displayCls}
                            showChooseModal={this.showChooseModal}
                            isShowAccount={isShowAccount}
                            defaultAccount={defaultAccount}
                        />
                    </TabPane>
                    <TabPane tab='增值税不抵扣勾选' key='2'>
                        <BdkgxInvoices
                            taxPeriod={taxPeriod}
                            skssq={skssq}
                            gxrqfw={gxrqfw}
                            access_token={access_token}
                            showLogin={this.onShowLogin}
                            bdkgxUrl={bdkgxUrl}
                            gxExportUrl={this.props.gxExportUrl}
                            gxImportUrl={this.props.gxImportUrl}
                            dkgxSearchUrl={dkgxSearchUrl}
                            rpaGxLogUrl={this.props.rpaGxLogUrl}
                            isEntryVoucher={this.props.isEntryVoucher}
                            clientType={clientType}
                            shrSourceUrl={this.props.shrSourceUrl}
                            userSource={userSource}
                            getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                            gitReviewerUrl={this.props.gitReviewerUrl}
                            clientConfig={{
                                taxTickPlatform,
                                loginType,
                                inputPathUrl
                            }}
                            onClientLogin={this.props.onClientLogin}
                            onOpenGxLog={this.openGxLog}
                            displayCls={this.props.displayCls}
                            showChooseModal={this.showChooseModal}
                            isShowAccount={isShowAccount}
                            defaultAccount={defaultAccount}
                        />
                    </TabPane>
                    {
                        parseInt(loginType) === 2 ? (
                            <TabPane tab='海关缴款书抵扣勾选' key='4'>
                                <CustomsDkgx
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    gxrqfw={gxrqfw}
                                    access_token={access_token}
                                    showLogin={this.onShowLogin}
                                    dkgxUrl={dkgxUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={loginType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    shrSourceUrl={this.props.shrSourceUrl}
                                    clientType={clientType}
                                    userSource={userSource}
                                    showChooseModal={this.showChooseModal}
                                    isShowAccount={isShowAccount}
                                    defaultAccount={defaultAccount}
                                />
                            </TabPane>
                        ) : null
                    }
                    {
                        parseInt(loginType) === 2 ? (
                            <TabPane tab='海关缴款书不抵扣勾选' key='5'>
                                <CustomsBdkgx
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    gxrqfw={gxrqfw}
                                    access_token={access_token}
                                    showLogin={this.onShowLogin}
                                    bdkgxUrl={bdkgxUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    shrSourceUrl={this.props.shrSourceUrl}
                                    fpdkType={loginType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    userSource={userSource}
                                    showChooseModal={this.showChooseModal}
                                    isShowAccount={isShowAccount}
                                    defaultAccount={defaultAccount}
                                />
                            </TabPane>
                        ) : null
                    }

                    <TabPane tab='抵扣勾选统计' key='3'>
                        <GxConfirm
                            skssq={skssq}
                            gxrqfw={gxrqfw}
                            collectUrl={collectUrl}
                            access_token={access_token}
                            showLogin={this.onShowLogin}
                            gxConfirmUrl={gxConfirmUrl}
                            searchTjUrl={searchTjUrl}
                            qxtjUrl={qxtjUrl}
                            sctjUrl={sctjUrl}
                            clientType={clientType}
                            clientConfig={{
                                taxTickPlatform,
                                loginType,
                                inputPathUrl
                            }}
                            onClientLogin={this.props.onClientLogin}
                        />
                    </TabPane>
                    <TabPane tab='勾选日志' key='6'>
                        <GxLogs
                            gxLogsSearchUrl={this.props.gxLogsSearchUrl}
                            gxLogsDownLoadUrl={this.props.gxLogsDownLoadUrl}
                            autoRefresh={this.state.autoRefresh}
                        />
                    </TabPane>
                </Tabs>
                <Modal
                    visible={unConfigClient}
                    closable={false}
                    title='温馨提示'
                    width={400}
                    footer={[
                        <Button type='primary' key='button' onClick={this.props.onGoConfigUrl}>
                            去配置
                        </Button>
                    ]}
                >
                    <div style={{ color: '#666' }}>未查询到税局配置信息,请管理员前往“第三方在线配置”菜单进行配置</div>
                </Modal>
                
                <ChooseAccount
                    visible={showAccount}
                    closeModal={this.closeModal}
                    handleChooseOk={this.handleChooseOk}
                    accountList={accountList}
                    defaultAccount={defaultAccount}
                />
            </div>
        );
    }
}

GxInvoices.propTypes = {
    access_token: PropTypes.string,
    gxLogsSearchUrl: PropTypes.string,
    gxLogsDownLoadUrl: PropTypes.string,
    dkgxSearchUrl: PropTypes.string.isRequired,
    shrSourceUrl: PropTypes.string.isRequired,
    collectUrl: PropTypes.string.isRequired,
    dkgxUrl: PropTypes.string.isRequired,
    bdkgxUrl: PropTypes.string.isRequired,
    gxConfirmUrl: PropTypes.string.isRequired,
    searchTjUrl: PropTypes.string.isRequired,
    qxtjUrl: PropTypes.string.isRequired,
    sctjUrl: PropTypes.string.isRequired,
    verifyConfigUrl: PropTypes.string.isRequired,
    gxExportUrl: PropTypes.string,
    gxImportUrl: PropTypes.string,
    exportUrl: PropTypes.string,
    periodQueryUrl: PropTypes.string,
    clientType: PropTypes.string,
    isEntryVoucher: PropTypes.number,
    dkgxAllUrl: PropTypes.string,
    getSingleAccountUrl: PropTypes.string,
    singleExportUrl: PropTypes.string,
    dkgxProgressUrl: PropTypes.string,
    excelParamUrl: PropTypes.string,
    getAuthCodeUrl: PropTypes.string,
    userSource: PropTypes.number,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    taxNo: PropTypes.string,
    onClientLogin: PropTypes.func.isRequired,
    onGoConfigUrl: PropTypes.func.isRequired,
    rpaGxLogUrl: PropTypes.string,
    displayCls: PropTypes.bool,
    accountList: PropTypes.array,
    handleAccount: PropTypes.func,
    isShowAccount: PropTypes.bool
};

export default GxInvoices;