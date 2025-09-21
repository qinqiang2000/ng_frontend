
import React from 'react';
import { connect } from 'dva';
import { ConfigProvider } from 'antd';
// import { SimpleMenuLayout } from '@piaozone.com/slideMenu';
import { GxInvoices, CollectInvoices, AccountManage, SimpleMenuLayout } from '../src/';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { Router, Route, Switch } from 'dva/router';
import PropTypes from 'prop-types';
moment.locale('zh-cn');


function mapStateToProps(state) {
    return {
        ...state.fpdkInfo,
        onDeleteInvoice: () => {
            
        },
        onCheckInvoice: (data) => {
            console.log(data);
        },
        onSaveInvoice: (data) => {
            console.log(data);
        }
    };
}

const PropsGxInvoices = connect(mapStateToProps)(GxInvoices);
const PropsCollectInvoices = connect(mapStateToProps)(CollectInvoices);

const routes = [{    
    name: 'accountManage',
    path: '/fpdk-web/accountManage',
    Layout: SimpleMenuLayout,
    Component: AccountManage
}, {    
    name: 'collectInvoices',
    path: '/fpdk-web/collectInvoices',
    Layout: SimpleMenuLayout,
    Component: PropsCollectInvoices
}, {
    name: 'gxInvoices',
    path: '/fpdk-web/gxInvoices',
    Layout: SimpleMenuLayout,
    Component: PropsGxInvoices
}];

function fpdkAppRoute(props) {
    const { history } = props;
    const contextConfig = { locale: zhCN };
    return (
        <ConfigProvider {...contextConfig}>
            <Router history={history}>
                <Switch>
                    {
                        routes.map(({ path, name, Layout, Component }) => {                            
                            return (
                                <Route 
                                    key={name}
                                    path={path} 
                                    exact
                                    render={(props) => {
                                        return (
                                            <Layout>
                                                <Component {...props} />
                                            </Layout>
                                        );
                                    }} 
                                />
                            );
                        })
                    }
                </Switch>
            </Router>
        </ConfigProvider>
    );    
}


fpdkAppRoute.propTypes = {
    history: PropTypes.object.isRequired
};

export default fpdkAppRoute;