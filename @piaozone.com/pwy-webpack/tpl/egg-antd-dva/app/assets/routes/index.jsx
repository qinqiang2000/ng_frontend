import React from 'react';
import { connect } from 'dva';

class Index extends React.Component {
    render() {
        return (
            <div>
                <h1>welcome to egg + antd + dva project!</h1>
            </div>
        );
    }
}

export default connect()(Index);