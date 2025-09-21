import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import RecommendQuery from './recommendQuery';
import SeniorQuery from './seniorQuery';
const { TabPane } = Tabs;
const AccountQuery = function({ userSource, getInvoiceSourceUrl, gitReviewerUrl, onSearch, onChangeTab }) {
    return (
        <div className='accountQuery'>
            <Tabs defaultActiveKey='1' animated={false} style={{ marginBottom: 15 }} className='pwyTabs' onChange={onChangeTab}>
                <TabPane tab='推荐查询' key='1'>
                    <RecommendQuery
                        onSearch={onSearch}
                        userSource={userSource}
                        getInvoiceSourceUrl={getInvoiceSourceUrl}
                        gitReviewerUrl={gitReviewerUrl}
                    />
                </TabPane>
                <TabPane tab='高级查询' key='2'>
                    <SeniorQuery
                        onSearch={onSearch}
                        userSource={userSource}
                        getInvoiceSourceUrl={getInvoiceSourceUrl}
                        gitReviewerUrl={gitReviewerUrl}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

AccountQuery.propTypes = {
    onSearch: PropTypes.func,
    onChangeTab: PropTypes.func,
    getInvoiceSourceUrl: PropTypes.string,
    gitReviewerUrl: PropTypes.string,
    userSource: PropTypes.string
};

export default AccountQuery;