import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import Apps from './Applications';
import Content from './Content';
import Header from './Header';
import Home from './Home';

import './index.less';

const propTypes = {
    children: PropTypes.node.isRequired
};

function FLayout(props) {
    const { children, ...restProps } = props;
    return (
        <Layout {...restProps}>
            {children}
        </Layout>
    );
}

FLayout.Header = Header;
FLayout.Content = Content;
FLayout.Home = Home;
FLayout.Apps = Apps;

FLayout.propTypes = propTypes;

export default FLayout;
