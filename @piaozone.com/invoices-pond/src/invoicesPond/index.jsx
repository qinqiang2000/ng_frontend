import React from 'react';
import { Tabs } from 'antd';
import './index.less';
import InvoicesPond from './invoicesPond';
import PropTypes from 'prop-types';
const { TabPane } = Tabs;

class InvoicesPonds extends React.Component {
    onChangeTab = () => {}
    render() {
        return (
            <div className='invoicesPond'>
                <Tabs defaultActiveKey='1' onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                    <TabPane tab='全票池查询' key='1'>
                        <InvoicesPond
                            onQueryInvoiceNums={this.props.onQueryInvoiceNums}
                            onQueryAccount={this.props.onQueryAccount}
                            exportElecFilesUrl={this.props.exportElecFilesUrl}
                            downloadElecFilesUrl={this.props.downloadElecFilesUrl}
                            applyDownloadUrl={this.props.applyDownloadUrl}
                            onContinueDownload={this.props.onContinueDownload}
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
                        />
                    </TabPane>

                </Tabs>
            </div>
        );
    }
}


InvoicesPonds.propTypes = {
    onQueryInvoiceNums: PropTypes.func.isRequired,
    onQueryAccount: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onAddInvoiceSign: PropTypes.func.isRequired,
    onAddExpenseInfo: PropTypes.func.isRequired,
    exportElecFilesUrl: PropTypes.string,
    downloadElecFilesUrl: PropTypes.string,
    applyDownloadUrl: PropTypes.string,
    onContinueDownload: PropTypes.func,
    onQueryRelateBill: PropTypes.func.isRequired,
    onChecklo: PropTypes.func.isRequired,
    onShowLedgerdata: PropTypes.func.isRequired,
    exporting: PropTypes.bool,
    loginInfo: PropTypes.object,
    updateEntryInfo: PropTypes.func,
    isEntryVoucher: PropTypes.number
};

export default InvoicesPonds;