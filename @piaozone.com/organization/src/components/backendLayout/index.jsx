import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import PropTypes from 'prop-types';

import SellerTop from '../sellerTop/';
import MenuLeft from '../menuLeft/';
import { Button } from 'antd';
import './backendLayout.css';

class BackendLayout extends React.Component {
    render() {
        const {
            children,
            contentCls = '',
            navList = [],
            clearPadding = false,
            onSave,
            pageName = '',
            isOrg = 1,
            fuserId = '1',
            history,
            prePath = '',
        } = this.props;


        const loginInfo = sessionStorage.getItem('loginInfo');

        if (!loginInfo) {
            window.globalHistory.replace('/');
        }

        return (
            <div className='newSellerCms'>
                {fuserId !== '' ? <SellerTop history={history} isOrg={isOrg} prePath={prePath} /> : null}
                <div className='contentBox'>
                    {isOrg === 1 ? (
                        <MenuLeft
                            className='menuLeft'
                            pageName={pageName}
                            prePath={prePath}
                        />
                    ) : null}
                    <div
                        className='content'
                        style={isOrg === 0 ? { left: 0 } : null}
                    >
                        <div className='contentTop'>
                            <p>
                                {navList.map((item, i) => {
                                    if (i === navList.length - 1) {
                                        return (
                                            <span className='navItem last' key={i}>
                                                {item.text}
                                            </span>
                                        );
                                    } else if (item.to === undefined) {
                                        return (
                                            <span className='navItem' key={i}>
                                                {item.text}
                                                <span className='slash'>/</span>
                                            </span>
                                        );
                                    } else {
                                        return (
                                            <Link className='navItem' to={item.to} key={i}>
                                                {item.text}
                                                <span className='slash'>/</span>
                                            </Link>
                                        );
                                    }
                                })}
                            </p>
                        </div>
                        <div
                            className={clearPadding ? 'outInner clearPadding' : 'outInner'}
                            style={onSave ? { bottom: 70 } : { bottom: 0 }}
                        >
                            <div
                                className={
                                    contentCls === ''
                                        ? 'contentInner'
                                        : 'contentInner ' + contentCls
                                }
                            >
                                {children}
                            </div>
                        </div>
                        {onSave ? (
                            <div className='bottomBtns'>
                                <Button className='empty'>取消</Button>
                                <Button className='light' type='primary'>
                                    保存
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { pageList, currentPage } = state.pages;

    return {
        pageList,
        currentPage
    };
}

BackendLayout.propTypes = {
    clearPadding: PropTypes.bool,
    onSave: PropTypes.func,
    children: PropTypes.any,
    pageName: PropTypes.string,
    isOrg: PropTypes.number,
    fuserId: PropTypes.string,
    history: PropTypes.object,
    prePath: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    pageList: PropTypes.array,
    currentPage: PropTypes.string,
    ComponentId: PropTypes.string,
    title: PropTypes.string
};

export default connect(mapStateToProps)(BackendLayout);
