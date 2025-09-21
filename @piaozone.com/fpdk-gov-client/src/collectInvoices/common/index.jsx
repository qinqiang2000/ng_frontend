import React from 'react';
import CollectInvoices from './collectInvoices';
import CollectInvoicesToHgx from './collectInvoicesToHgx';
import PropTypes from 'prop-types';

class CommonCollect extends React.Component {
    render() {
        const { useInvoiceConfig } = this.props;
        return (
            <>
                {
                    useInvoiceConfig ? (
                        <CollectInvoicesToHgx
                            onConformInvoiceUpload={this.props.onConformInvoiceUpload}
                            onConformInvoiceInsert={this.props.onConformInvoiceInsert}
                            onCheckInvoice={this.props.onCheckInvoice}
                            onSaveInvoice={this.props.onSaveInvoice}
                            onDeleteInvoice={this.props.onDeleteInvoice}
                            onExportExcel={this.props.onExportExcel}
                            scanFileStaticJs={this.props.scanFileStaticJs}
                            exporting={this.props.exporting}
                            userSource={this.props.userSource}
                        />
                    ) : (
                        <CollectInvoices
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
                        />
                    )
                }    
            </>
        );
    }
}


CommonCollect.propTypes = {
    onConformInvoiceUpload: PropTypes.string,
    onConformInvoiceInsert: PropTypes.func,
    onGetWxQr: PropTypes.func.isRequired,
    recognizeUrl: PropTypes.string.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onExportRecodeExcel: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    uploadGxFileUrl: PropTypes.string,
    uploadJxxUrl: PropTypes.string,
    userSource: PropTypes.number,
    useInvoiceConfig: PropTypes.bool
};

export default CommonCollect;