import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import PropTypes from 'prop-types';
import { routes } from './routes';

function fpdkAppRoute(props) {
    const { history } = props;
    return (
        <div>
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
        </div>
    );
}


fpdkAppRoute.propTypes = {
    history: PropTypes.object.isRequired
};



export default fpdkAppRoute;