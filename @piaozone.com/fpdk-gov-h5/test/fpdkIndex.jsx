import React from 'react';
// import { Link } from 'dva/router';
import PropTypes from 'prop-types';
import { SimpleMenuLayout } from '@piaozone.com/slideMenu';

// 进项税额管理, , 进项发票管理
const jxfpglIcon = require('./img/jxfpgl.svg');

class FpdkIndex extends React.Component {    
    constructor(props) {
        super(...arguments);
        const { PAGE_PRE_PATH } = props;
        this.state = {
            menuConfig: [{
                fid: 1,
                name: '进项管理',
                icon: jxfpglIcon,
                active: true,
                menuConfig: [{
                    active: true,
                    fid: 1,
                    name: '采集发票',
                    path: PAGE_PRE_PATH + '/collectInvoices'
                }, {
                    fid: 2,
                    name: '勾选认证',
                    path: PAGE_PRE_PATH + '/gxInvoices'
                }]
            }]
        };
    }

    render() {
        return (
            <SimpleMenuLayout menuConfig={this.state.menuConfig} />
        );
    }
}

FpdkIndex.propTypes = {
    PAGE_PRE_PATH: PropTypes.string
};

export default FpdkIndex;
