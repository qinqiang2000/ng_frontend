import React from 'react';
import { Tabs } from 'antd';
import './style.less';
import DkgxLogs from './dkgxLogs';
import PropTypes from 'prop-types';

const { TabPane } = Tabs;

class GxLogs extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activeTab: '1'
        };
    }

    onChangeTab = () => {

    }

    render() {
        const { getAccoutUrl, getSingleAccountUrl, singleExportUrl, dkgxProgressUrl } = this.props;
        return (
            <div>
                <Tabs defaultActiveKey='1' animated={false} style={{ marginBottom: 15 }} className='pwyTabs'>
                    <TabPane tab='抵扣勾选日志' key='1'>
                        <DkgxLogs
                            getAccoutUrl={getAccoutUrl}
                            getSingleAccountUrl={getSingleAccountUrl}
                            singleExportUrl={singleExportUrl}
                            dkgxProgressUrl={dkgxProgressUrl}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

GxLogs.propTypes = {
    getAccoutUrl: PropTypes.string.isRequired,
    getSingleAccountUrl: PropTypes.string.isRequired,
    singleExportUrl: PropTypes.string.isRequired,
    dkgxProgressUrl: PropTypes.string.isRequired
};

export default GxLogs;