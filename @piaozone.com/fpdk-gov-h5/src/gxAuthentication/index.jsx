import React from 'react';
import { Tabs, Modal, message } from 'antd';
import './less/style.less';
import DkgxInvoices from './dkgx';
import BdkgxInvoices from './bdkgx';
import CustomsDkgx from './customsDkgx';
import CustomsBdkgx from './customsBdkgx';
import GxConfirm from './gxConfirm';
import FpdkLogin from '../fpdkLogin';
import PropTypes from 'prop-types';
import { govFpdkOperate } from '@piaozone.com/swjgFpdkV4';
import { kdRequest } from '@piaozone.com/utils';


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
            activeTab: '1',
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
        const { showLoginDialog, loginGovInfo, taxPeriod, skssq } = this.state;
        const {
            dkgxUrl, bdkgxUrl, gxConfirmUrl, searchTjUrl,
            qxtjUrl, sctjUrl, dkgxSearchUrl, access_token,
            collectUrl, fpdkType = 1, clientType = 1
        } = this.props;
        return (
            <div>
                <Tabs defaultActiveKey='1' onChange={this.onChangeTab} animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                    <TabPane tab='增值税抵扣勾选' key='1'>
                        <DkgxInvoices
                            taxPeriod={taxPeriod}
                            skssq={skssq}
                            access_token={access_token}
                            govOperate={this.govOperate}
                            showLogin={this.onShowLogin}
                            loginGovInfo={loginGovInfo}
                            dkgxUrl={dkgxUrl}
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
                        />
                    </TabPane>
                    <TabPane tab='增值税不抵扣勾选' key='2'>
                        <BdkgxInvoices
                            taxPeriod={taxPeriod}
                            skssq={skssq}
                            access_token={access_token}
                            govOperate={this.govOperate}
                            showLogin={this.onShowLogin}
                            loginGovInfo={loginGovInfo}
                            bdkgxUrl={bdkgxUrl}
                            dkgxSearchUrl={dkgxSearchUrl}
                            fpdkType={fpdkType}
                            isEntryVoucher={this.props.isEntryVoucher}
                            clientType={clientType}
                            periodQueryUrl={this.props.periodQueryUrl}
                        />
                    </TabPane>
                    {
                        fpdkType === 2 ? (
                            <TabPane tab='海关缴款书抵扣勾选' key='4'>
                                <CustomsDkgx
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    access_token={access_token}
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    dkgxUrl={dkgxUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                />
                            </TabPane>
                        ) : null
                    }
                    {
                        fpdkType === 2 ? (
                            <TabPane tab='海关缴款书不抵扣勾选' key='5'>
                                <CustomsBdkgx
                                    taxPeriod={taxPeriod}
                                    skssq={skssq}
                                    access_token={access_token}
                                    govOperate={this.govOperate}
                                    showLogin={this.onShowLogin}
                                    loginGovInfo={loginGovInfo}
                                    bdkgxUrl={bdkgxUrl}
                                    dkgxSearchUrl={dkgxSearchUrl}
                                    fpdkType={fpdkType}
                                    isEntryVoucher={this.props.isEntryVoucher}
                                    clientType={clientType}
                                    periodQueryUrl={this.props.periodQueryUrl}
                                />
                            </TabPane>
                        ) : null
                    }

                    <TabPane tab='抵扣勾选统计' key='3'>
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
                <Modal
                    visible={showLoginDialog}
                    onCancel={() => this.setState({ showLoginDialog: false })}
                    footer={null}
                    destroyOnClose={true}
                >
                    <FpdkLogin onLogin={this.onLogin} govOperate={this.govOperate} />
                </Modal>
            </div>
        );
    }
}

GxInvoices.propTypes = {
    diskInfoArr: PropTypes.array,
    access_token: PropTypes.string,
    diskInfoIndex: PropTypes.number,
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
    fpdkType: PropTypes.number,
    periodQueryUrl: PropTypes.string,
    clientType: PropTypes.string,
    isEntryVoucher: PropTypes.number,
    dkgxAllUrl: PropTypes.string,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired
};

export default GxInvoices;