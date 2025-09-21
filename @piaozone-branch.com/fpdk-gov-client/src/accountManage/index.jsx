import React from 'react';
import { Tabs } from 'antd';
import './style.less';
import AccountManage from './accountManage';
import Statics from './statics';
import PropTypes from 'prop-types';
const { TabPane } = Tabs;

class AccouteManage extends React.Component {
    onChangeTab = () => {}
    render() {
        return (
            <div className='outAccountManage'>
                <Tabs defaultActiveKey='1' onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                    <TabPane tab='台账管理' key='1'>
                        <AccountManage
                            onQueryInvoiceNums={this.props.onQueryInvoiceNums}
                            onQueryAccount={this.props.onQueryAccount}
                            onDkInvoice={this.props.onDkInvoice}
                            // onEnableInvoice={this.props.onEnableInvoice}
                            shrSourceUrl={this.props.shrSourceUrl}
                            updateAttachUrl={this.props.updateAttachUrl}
                            queryInvoiceUrl={this.props.queryInvoiceUrl}
                            getExpenseNumUrl={this.props.getExpenseNumUrl}
                            queryAttachUrl={this.props.queryAttachUrl}
                            queryTripUrl={this.props.queryTripUrl}
                            exportElecFilesUrl={this.props.exportElecFilesUrl}
                            downloadElecFilesUrl={this.props.downloadElecFilesUrl}
                            applyDownloadUrl={this.props.applyDownloadUrl}
                            onContinueDownload={this.props.onContinueDownload}
                            onStopInvoice={this.props.onStopInvoice}
                            onCheckInvoice={this.props.onCheckInvoice}
                            onSaveInvoice={this.props.onSaveInvoice}
                            onDeleteInvoice={this.props.onDeleteInvoice}
                            onExportExcel={this.props.onExportExcel}
                            onAddInvoiceSign={this.props.onAddInvoiceSign}
                            onAddExpenseInfo={this.props.onAddExpenseInfo}
                            onQueryRelateBill={this.props.onQueryRelateBill}
                            exporting={this.props.exporting}
                            onChecklo={this.props.onChecklo}
                            onShowLedgerdata={this.props.onShowLedgerdata}
                            loginInfo={this.props.loginInfo}
                            isEntryVoucher={this.props.isEntryVoucher}
                            updateEntryInfo={this.props.updateEntryInfo}
                            queryOtherInfoUrl={this.props.queryOtherInfoUrl}
                            currentOrgisAdmin={this.props.currentOrgisAdmin}
                            userSource={this.props.userSource}
                            getInvoiceSourceUrl={this.props.getInvoiceSourceUrl}
                            gitReviewerUrl={this.props.gitReviewerUrl}
                            useNewAccountQuery={this.props.useNewAccountQuery}
                            onBatchDelete={this.props.onBatchDelete}
                            expandSearchRange={this.props.expandSearchRange}
                        />
                    </TabPane>
                    <TabPane tab='数据统计' key='2'>
                        <Statics
                            onExportCount={this.props.onExportCount}
                            onQueryStatics={this.props.onQueryStatics}
                            exportStaticIng={this.props.exportStaticIng}
                        />
                    </TabPane>

                </Tabs>
            </div>
        );
    }
}


AccouteManage.propTypes = {
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onDkInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onExportCount: PropTypes.func.isRequired,
    onAddInvoiceSign: PropTypes.func.isRequired,
    onAddExpenseInfo: PropTypes.func.isRequired,
    // onEnableInvoice: PropTypes.func.isRequired,
    exportElecFilesUrl: PropTypes.string,
    downloadElecFilesUrl: PropTypes.string,
    applyDownloadUrl: PropTypes.string,
    onContinueDownload: PropTypes.func,
    onStopInvoice: PropTypes.func.isRequired,
    onQueryStatics: PropTypes.func.isRequired,
    onQueryRelateBill: PropTypes.func.isRequired,
    onChecklo: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    exporting: PropTypes.bool,
    exportStaticIng: PropTypes.bool,
    loginInfo: PropTypes.object,
    updateEntryInfo: PropTypes.func,
    isEntryVoucher: PropTypes.number,
    updateAttachUrl: PropTypes.string,
    queryAttachUrl: PropTypes.string,
    queryTripUrl: PropTypes.string,
    shrSourceUrl: PropTypes.string,
    queryOtherInfoUrl: PropTypes.string,
    currentOrgisAdmin: PropTypes.string,
    queryInvoiceUrl: PropTypes.string,
    getExpenseNumUrl: PropTypes.string,
    userSource: PropTypes.string,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    useNewAccountQuery: PropTypes.bool,
    onBatchDelete: PropTypes.func.isRequired,
    expandSearchRange: PropTypes.bool
};

export default AccouteManage;