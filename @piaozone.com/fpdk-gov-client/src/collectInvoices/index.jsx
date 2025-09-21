import React from 'react';
import { Tabs, Modal } from 'antd';
import './style.less';
import DiskCollectInvoice from './diskCollect';
import FpdkLogin from '../fpdkLogin';
import PropTypes from 'prop-types';
import { govFpdkOperate } from '@piaozone.com/swjgFpdkV4';
import DiskJxxDownload from './diskJxxDownload';
import CollectLogs from './collectLogs';
import EpsonCollect from './epson';
import CommonCollect from './common';
const { TabPane } = Tabs;

class AccessCollectInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        const { diskInfoArr = [], diskInfoIndex = 0, firstLoginUrl = '', secondLoginUrl = '', collectUrl = '', fpdkType = 1 } = props;
        const diskInfo = diskInfoArr[diskInfoIndex] || {};
        this.govOperate = govFpdkOperate.getInstanceByTaxNo({
            firstLoginUrl,
            secondLoginUrl,
            collectUrl,
            taxNo: diskInfo.taxNo,
            password: diskInfo.password || '',
            ptPassword: diskInfo.ptPassword || '',
            operateUrl: diskInfo.operateUrl,
            fpdkType: parseInt(fpdkType),
            useInvoiceConfig: false,
            showLogin: this.onShowLogin
        });

        this.state = {
            activeTab: '1',
            showLoginDialog: false,
            loginGovInfo: this.govOperate.loginGovInfo
        };
        if (window.DWObject) {
            window.location.reload();
        }
    }

    onChangeTab = () => {

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

    render() {
        const { showLoginDialog, loginGovInfo } = this.state;
        const {
            useInvoiceConfig,
            access_token,
            collectUrl,
            downloadAccountQueryUrl,
            downloadApplyUrl,
            clientType,
            fpdkType,
            querySyncLogUrl,
            activeTab = '1',
            userSource = 1,
            taxNo,
            API_PRE_PATH
        } = this.props;

        return (
            <div>
                <Tabs defaultActiveKey={activeTab} onChange={this.onChangeTab} animated={false} className='pwyTabs'>
                    <TabPane tab='采集发票' key='1'>
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
                    {
                        this.props.userSource != 8 ? (
                            <TabPane tab='税盘下载' key='2'>
                                <DiskCollectInvoice
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    access_token={access_token}
                                    collectUrl={collectUrl}
                                    fpdkType={fpdkType}
                                />
                            </TabPane>
                        ) : null
                    }
                    {
                        downloadAccountQueryUrl && downloadApplyUrl && fpdkType === 1 ? (
                            <TabPane tab='进销项下载' key='3'>
                                <DiskJxxDownload
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    access_token={access_token}
                                    downloadAccountQueryUrl={downloadAccountQueryUrl}
                                    downloadApplyUrl={downloadApplyUrl}
                                    handlerErrApplyUrl={this.props.handlerErrApplyUrl}
                                    clientType={clientType}
                                    fpdkType={fpdkType}
                                />
                            </TabPane>
                        ) : querySyncLogUrl && fpdkType === 2 && userSource != 8 ? (
                            <TabPane tab='同步日志' key='3'>
                                <CollectLogs
                                    access_token={access_token}
                                    querySyncLogUrl={querySyncLogUrl}
                                    downloadApplyUrl={downloadApplyUrl}
                                    reprocessSyncUrl={this.props.reprocessSyncUrl}
                                    clientType={clientType}
                                    fpdkType={fpdkType}
                                />
                            </TabPane>
                        ) : null
                    }
                </Tabs>
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


AccessCollectInvoices.propTypes = {
    diskInfoArr: PropTypes.array,
    diskInfoIndex: PropTypes.number,
    access_token: PropTypes.string,
    firstLoginUrl: PropTypes.string.isRequired,
    secondLoginUrl: PropTypes.string.isRequired,
    collectUrl: PropTypes.string.isRequired,
    downloadAccountQueryUrl: PropTypes.string,
    downloadApplyUrl: PropTypes.string.isRequired,
    getCurrentBindInfo: PropTypes.string.isRequired,
    saveCurrentBindInfo: PropTypes.string.isRequired,
    handlerErrApplyUrl: PropTypes.string,
    clientType: PropTypes.number,
    recognizeUrl: PropTypes.string.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onExportRecodeExcel: PropTypes.func.isRequired,
    onGetWxQr: PropTypes.func.isRequired,
    useInvoiceConfig: PropTypes.bool,
    onConformInvoiceUpload: PropTypes.string.isRequired,
    onConformInvoiceInsert: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    fpdkType: PropTypes.number,
    querySyncLogUrl: PropTypes.string,
    reprocessSyncUrl: PropTypes.string,
    uploadGxFileUrl: PropTypes.string,
    uploadJxxUrl: PropTypes.string,
    activeTab: PropTypes.string,
    userSource: PropTypes.number,
    taxNo: PropTypes.string,
    API_PRE_PATH: PropTypes.string
};

export default AccessCollectInvoices;