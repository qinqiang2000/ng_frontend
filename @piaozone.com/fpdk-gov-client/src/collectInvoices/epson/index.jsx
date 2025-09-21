import React from 'react';
import EpsonCollectInvoices from './epsonCollectInvoices';
import EpsonCollectInvoicesToHgx from './epsonCollectInvoicesToHgx';
import PropTypes from 'prop-types';
class EpsonCollect extends React.Component {
    render() {
        const { useInvoiceConfig } = this.props; //true:走合规性校验
        return (
            <>
                {
                    useInvoiceConfig ? (
                        <EpsonCollectInvoicesToHgx
                            onConformInvoiceUpload={this.props.onConformInvoiceUpload}
                            onConformInvoiceInsert={this.props.onConformInvoiceInsert}
                            onCheckInvoice={this.props.onCheckInvoice}
                            onSaveInvoice={this.props.onSaveInvoice}
                            onDeleteInvoice={this.props.onDeleteInvoice}
                            onExportExcel={this.props.onExportExcel}
                            scanFileStaticJs={this.props.scanFileStaticJs}
                            exporting={this.props.exporting}
                            getCurrentBindInfo={this.props.getCurrentBindInfo}
                            saveCurrentBindInfo={this.props.saveCurrentBindInfo}
                        />
                    ) : (
                        <EpsonCollectInvoices
                            recognizeUrl={this.props.recognizeUrl}
                            onCheckInvoice={this.props.onCheckInvoice}
                            onSaveInvoice={this.props.onSaveInvoice}
                            onDeleteInvoice={this.props.onDeleteInvoice}
                            onExportExcel={this.props.onExportExcel}
                            onGetWxQr={this.props.onGetWxQr}
                            scanFileStaticJs={this.props.scanFileStaticJs}
                            exporting={this.props.exporting}
                            getCurrentBindInfo={this.props.getCurrentBindInfo}
                            saveCurrentBindInfo={this.props.saveCurrentBindInfo}
                        />
                    )
                }
            </>
        );
    }
}


EpsonCollect.propTypes = {
    onConformInvoiceUpload: PropTypes.string.isRequired,
    onConformInvoiceInsert: PropTypes.func.isRequired,
    onGetWxQr: PropTypes.func.isRequired,
    recognizeUrl: PropTypes.string.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    getCurrentBindInfo: PropTypes.string.isRequired,
    saveCurrentBindInfo: PropTypes.string.isRequired,
    useInvoiceConfig: PropTypes.bool
};

export default EpsonCollect;