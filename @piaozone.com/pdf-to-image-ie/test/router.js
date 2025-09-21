import React from 'react';
import { ConfigProvider } from 'antd';
import { Router, Route, Switch } from 'dva/router';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from 'antd/es/locale/zh_CN';
import { routes } from './routes';

moment.locale('zh-cn');

function fpdkAppRoute(props) {
    const { history } = props;
    const contextConfig = {
        locale: zhCN,
        getPopupContainer: () => {
            return document.body;
        }
    };
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
                                        if (Layout) {
                                            return (
                                                <Layout>
                                                    <Component {...props} />
                                                </Layout>
                                            );
                                        } else {
                                            return <Component {...props} />;
                                        }
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