import React from 'react';
import { connect } from 'dva';

class Index extends React.Component {
    render() {
        return (
            <div>
                <h1>welcome to pwy page!</h1>
            </div>
        );
    }
}

export default connect()(Index);