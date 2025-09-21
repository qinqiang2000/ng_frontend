import React from 'react';
import './style.less';
import AccountManage from './accountManage';
import PropTypes from 'prop-types';

class AccouteManage extends React.Component {
    render() {
        return (
            <div className='outAccountManage'>
                <AccountManage
                    onQueryInvoiceNums={this.props.onQueryInvoiceNums}
                    onQueryAccount={this.props.onQueryAccount}
                    onDkInvoice={this.props.onDkInvoice}
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
                />
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
    onAddInvoiceSign: PropTypes.func.isRequired,
    onAddExpenseInfo: PropTypes.func.isRequired,
    exportElecFilesUrl: PropTypes.object,
    downloadElecFilesUrl: PropTypes.string,
    applyDownloadUrl: PropTypes.object,
    onContinueDownload: PropTypes.func,
    onStopInvoice: PropTypes.func.isRequired,
    onQueryRelateBill: PropTypes.func.isRequired,
    onChecklo: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    exporting: PropTypes.bool,
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
    gitReviewerUrl: PropTypes.string
};

export default AccouteManage;