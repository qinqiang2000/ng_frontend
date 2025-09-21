import React from 'react';
import { message, Tabs, Modal, Button } from 'antd';
import './style.less';
import DiskCollectInvoice from './diskCollect';
import PropTypes from 'prop-types';
import { pwyFetch } from '@piaozone.com/utils';
import DigitalElelLogs from './digitalElelLogs';
import Applet from './applet';
import CollectLogs from './collectLogs';
import EpsonCollect from './epson';
import CommonCollect from './common';
import ChooseAccount from '../commons/chooseAccount';

const { TabPane } = Tabs;

class AccessCollectInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activeTab: '1',
            clientConfig: {
                loginType: 2
            },
            unConfigClient: false,
            showAccount: false
        };
        if (window.DWObject) {
            window.location.reload();
        }
    }

    componentDidMount() {
        const { showOnlyCollect } = this.props;
        if (!showOnlyCollect) {
            this.onGetCompanyConfig();
        }
    }

    async onGetCompanyConfig() {
        const res = await pwyFetch(this.props.verifyConfigUrl, {
            method: 'POST',
            data: {
                revenueNumber: this.props.taxNo
            }
        });
        if (res.errcode != '0000') {
            message.info(res.description);
            this.setState({
                clientConfig: null,
                unConfigClient: true
            });
        }
        if (res.data && res.data.length > 0) {
            const { taxTickPlatform, loginType, inputPathUrl } = res.data[0];
            this.setState({
                clientConfig: {
                    taxTickPlatform,
                    loginType,
                    inputPathUrl
                }
            });
        } else {
            this.setState({
                clientConfig: null,
                unConfigClient: true
            });
        }
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
        const { clientConfig, unConfigClient, showAccount } = this.state;
        const {
            useInvoiceConfig,
            access_token,
            collectUrl,
            downloadApplyUrl,
            clientType,
            querySyncLogUrl,
            queryDigitalLogsUrl,
            downLoadDigitalApplyUrl,
            activeTab = '1',
            userSource = 1,
            showOnlyCollect,
            accountList = [],
            isShowAccount,
            switchPersonal
        } = this.props;
        const defaultAccount = accountList.length === 1 ? accountList[0] : accountList.filter(item => item.selected)[0] || {};
        return (
            <div>
                {
                    showOnlyCollect ? (
                        <Tabs defaultActiveKey={activeTab} animated={false} className='pwyTabs'>
                            {
                                switchPersonal && useInvoiceConfig && userSource != 8 ? (
                                    <TabPane tab='小程序采集' key='1'>
                                        <Applet
                                            onQueryAccount={this.props.onQueryAccount}
                                            onQueryInvoiceNums={this.props.onQueryInvoiceNums}
                                            onGetWxQr={this.props.onGetWxQr}
                                            queryPushAccountLogsUrl={this.props.queryPushAccountLogsUrl}
                                            pushToAccountUrl={this.props.pushToAccountUrl}
                                            getUserBindInfoUrl={this.props.getUserBindInfoUrl}
                                        />
                                    </TabPane>
                                ) : null
                            }
                            <TabPane tab='采集发票' key='2'>
                                {
                                    userSource == 8 ? (
                                        <EpsonCollect
                                            recognizeUrl={this.props.recognizeUrl}
                                            onCheckInvoice={this.props.onCheckInvoice}
                                            onSaveInvoice={this.props.onSaveInvoice}
                                            onDeleteInvoice={this.props.onDeleteInvoice}
                                            onExportExcel={this.props.onExportExcel}
                                            onGetWxQr={this.props.onGetWxQr}
                                            scanFileStaticJs={this.props.scanFileStaticJs}
                                            exporting={this.props.exporting}
                                            uploadGxFileUrl={this.props.uploadGxFileUrl}
                                            uploadJxxUrl={this.props.uploadJxxUrl}
                                            getCurrentBindInfo={this.props.getCurrentBindInfo}
                                            saveCurrentBindInfo={this.props.saveCurrentBindInfo}
                                            useInvoiceConfig={useInvoiceConfig}
                                            onConformInvoiceUpload={this.props.onConformInvoiceUpload}
                                            onConformInvoiceInsert={this.props.onConformInvoiceInsert}
                                        />
                                    ) : (
                                        <CommonCollect
                                            recognizeUrl={this.props.recognizeUrl}
                                            checkBlockChainUrl={this.props.checkBlockChainUrl}
                                            onCheckInvoice={this.props.onCheckInvoice}
                                            onSaveInvoice={this.props.onSaveInvoice}
                                            onDeleteInvoice={this.props.onDeleteInvoice}
                                            onExportExcel={this.props.onExportExcel}
                                            onExportRecodeExcel={this.props.onExportRecodeExcel}
                                            onGetWxQr={this.props.onGetWxQr}
                                            scanFileStaticJs={this.props.scanFileStaticJs}
                                            exporting={this.props.exporting}
                                            uploadGxFileUrl={this.props.uploadGxFileUrl}
                                            uploadJxxUrl={this.props.uploadJxxUrl}
                                            userSource={this.props.userSource}
                                            useInvoiceConfig={useInvoiceConfig}
                                            onConformInvoiceUpload={this.props.onConformInvoiceUpload}
                                            onConformInvoiceInsert={this.props.onConformInvoiceInsert}
                                        />
                                    )
                                }
                            </TabPane>
                        </Tabs>
                    ) : (
                        <Tabs defaultActiveKey={activeTab} animated={false} className='pwyTabs'>
                            {
                                userSource != 8 ? (
                                    <TabPane tab='发票关键要素同步' key='1'>
                                        <DiskCollectInvoice
                                            access_token={access_token}
                                            collectUrl={collectUrl}
                                            getClientTokenUrl={this.props.getClientTokenUrl}
                                            taxNo={this.props.taxNo}
                                            clientConfig={clientConfig}
                                            onClientLogin={this.props.onClientLogin}
                                            showChooseModal={this.showChooseModal}
                                            isShowAccount={isShowAccount}
                                            defaultAccount={defaultAccount}
                                            clientLoginUrl={this.props.clientLoginUrl}
                                        />
                                    </TabPane>
                                ) : null
                            }
                            {
                                querySyncLogUrl && userSource != 8 ? (
                                    <TabPane tab='发票全量数据同步' key='2'>
                                        <CollectLogs
                                            access_token={access_token}
                                            querySyncLogUrl={querySyncLogUrl}
                                            downloadApplyUrl={downloadApplyUrl}
                                            addApplyLogUrl={this.props.addApplyLogUrl}
                                            reprocessSyncUrl={this.props.reprocessSyncUrl}
                                            downLoadDigitalApplyUrl={downLoadDigitalApplyUrl}
                                            clientType={clientType}
                                            taxNo={this.props.taxNo}
                                            clientConfig={clientConfig}
                                            onClientLogin={this.props.onClientLogin}
                                            showChooseModal={this.showChooseModal}
                                            isShowAccount={isShowAccount}
                                            defaultAccount={defaultAccount}
                                            isSupport_eleDownLoad={this.props.isSupport_eleDownLoad}
                                            clientLoginUrl={this.props.clientLoginUrl}
                                        />
                                    </TabPane>
                                ) : null
                            }
                            {
                                userSource != 8 && this.props.isSupport_eleDownLoad ? (
                                    <TabPane tab='数电票文件下载日志' key='3'>
                                        <DigitalElelLogs
                                            access_token={access_token}
                                            queryDigitalLogsUrl={queryDigitalLogsUrl}
                                            downloadApplyUrl={downloadApplyUrl}
                                            addApplyLogUrl={this.props.addApplyLogUrl}
                                            reprocessSyncUrl={this.props.reprocessSyncUrl}
                                            clientType={clientType}
                                            taxNo={this.props.taxNo}
                                            clientConfig={clientConfig}
                                            onClientLogin={this.props.onClientLogin}
                                            reTryDownloadUrl={this.props.reTryDownloadUrl}
                                        />
                                    </TabPane>
                                ) : null
                            }
                        </Tabs>
                    )
                }

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


AccessCollectInvoices.propTypes = {
    isSupport_eleDownLoad: PropTypes.bool,
    access_token: PropTypes.string,
    collectUrl: PropTypes.string.isRequired,
    downloadApplyUrl: PropTypes.string.isRequired,
    getCurrentBindInfo: PropTypes.string.isRequired,
    saveCurrentBindInfo: PropTypes.string.isRequired,
    verifyConfigUrl: PropTypes.string.isRequired,
    addApplyLogUrl: PropTypes.string.isRequired,
    getClientTokenUrl: PropTypes.string.isRequired,
    clientType: PropTypes.number,
    recognizeUrl: PropTypes.string.isRequired,
    checkBlockChainUrl: PropTypes.string,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onGoConfigUrl: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onExportRecodeExcel: PropTypes.func.isRequired,
    onGetWxQr: PropTypes.func.isRequired,
    useInvoiceConfig: PropTypes.bool,
    onConformInvoiceUpload: PropTypes.string.isRequired,
    onConformInvoiceInsert: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    querySyncLogUrl: PropTypes.string,
    queryDigitalLogsUrl: PropTypes.string,
    downLoadDigitalApplyUrl: PropTypes.string,
    reprocessSyncUrl: PropTypes.string,
    uploadGxFileUrl: PropTypes.string,
    uploadJxxUrl: PropTypes.string,
    activeTab: PropTypes.string,
    userSource: PropTypes.number,
    switchPersonal: PropTypes.bool,
    taxNo: PropTypes.string,
    onClientLogin: PropTypes.func.isRequired,
    showOnlyCollect: PropTypes.bool,
    accountList: PropTypes.array,
    handleAccount: PropTypes.func,
    isShowAccount: PropTypes.bool,
    onQueryAccount: PropTypes.func.isRequired,
    onQueryInvoiceNums: PropTypes.func.isRequired,
    queryPushAccountLogsUrl: PropTypes.string,
    pushToAccountUrl: PropTypes.string,
    getUserBindInfoUrl: PropTypes.string,
    reTryDownloadUrl: PropTypes.reTryDownloadUrl,
    clientLoginUrl: PropTypes.bool
};

export default AccessCollectInvoices;