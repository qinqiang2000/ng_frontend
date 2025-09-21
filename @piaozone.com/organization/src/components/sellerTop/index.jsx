import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Modal, message, Icon } from 'antd';
import SwitchableEntities from '../switchableEntities/';

import './seller-top.css';
const logo = require('./img/logo@2x.png');
const confirm = Modal.confirm;

class SellerTop extends React.Component {
    constructor(props) {
        super(...arguments);
        this.logout = this.logout.bind(this);
        this.onSelectEntity = this.onSelectEntity.bind(this);
        this.onSearchEntity = this.onSearchEntity.bind(this);
        this.state = {
            showPanel: false,
            searchValue: '',
            application: sessionStorage.getItem('application') // 兼容操作手册，添加应用标识，商家平台portal-web首页会添加
        };
    }

    logout() {
        confirm({
            title: '退出确认',
            content: '确定要退出系统吗?',
            onOk: () => {
                this.props.dispatch({ type: 'login/logout', payload: {} }).then(res => {
                    if (res.errcode === '0000') {
                        window.globalHistory.replace('/');
                    } else {
                        message.info(res.description);
                    }
                });
            },
            okText: '确定',
            cancelText: '取消'
        });
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onSelectEntity(entityInfo) {
        const current = this.props.currentOrgId;
        const { entityOuNo, employeeOuNo, entityOuName, taxNo, entityOuType, fpdkType } = entityInfo;
        if (!this._isMounted) {
            return false;
        }

        if (current === entityOuNo) {
            return false;
        } else {
            confirm({
                title: '切换组织确认',
                content: '确定要切换当前组织吗?',
                onOk: () => {
                    this.props
                        .dispatch({
                            type: 'login/changeCurOrg',
                            payload: { employeeOuNo, entityOuNo, entityOuName, taxNo, entityOuType, fpdkType }
                        })
                        .then(res => {
                            if (res.errcode === '0000') {
                                this.setState({
                                    showPanel: false
                                });
                                window.location = window.location.pathname;
                                window.mercyMode.showMercy();
                            } else {
                                message.error(res.description);
                            }
                        });
                },
                okText: '确定',
                cancelText: '取消'
            });
        }
    }

    onSearchEntity(param) {
        // 根据组织名称模糊搜索匹配
        this.setState({
            searchValue: param
        });
    }

    render() {
        const { application, showPanel, searchValue } = this.state;
        const {
            isOrg = '1',
            prePath
        } = this.props;

        return (
            <div className='newSellerTop clearfix'>
                <div className='floatLeft'>
                    {window.location.origin.includes('tax-ep') ? (
                        <>
                            <span className='descrip'>
                                发票云管家
                            </span>
                        </>
                    ) : (
                        <>
                            <img src={logo} className='logo' alt='金蝶发票云' />
                            <span className='descrip'>商户运营平台</span>
                        </>
                    )}
                </div>

                <div className='companyInfo floatRight'>
                    {application === 'portal-web' ? (
                        <>
                            <a
                                style={{ marginRight: 25 }}
                                href={prePath + '/newsCenter'}
                            >
                                <Icon type="bell" style={{ fontSize: 16 }} />
                            </a>
                            <a
                                style={{ marginRight: 25 }}
                                href={prePath + '/operationManual'}
                            >
                                操作手册
                            </a>
                        </>
                    ) : null}

                    {isOrg === 1 ? (
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 25,
                                height: '100%'
                            }}
                            onMouseLeave={() => this.setState({ showPanel: false })}
                        >
                            {/* <span className='cname'>{this.props.loginInfo.rootOrgName}</span> */}
                            <div
                                className='lists'
                                onMouseEnter={() => this.setState({ showPanel: true })}
                            >
                                <div className='selected'>{this.props.currentOrgName}</div>
                                <Icon
                                    type='caret-down'
                                    style={{ color: '#bbb' }}
                                />
                            </div>
                            <SwitchableEntities
                                searchValue={searchValue}
                                visible={showPanel}
                                onSelectEntity={this.onSelectEntity}
                                onSearchEntity={this.onSearchEntity}
                            />
                        </div>
                    ) : null}

                    <div className='cute' />

                    <img className='avatar' src={this.props.loginInfo.avatar} />

                    <a className='logoutIcon' onClick={this.logout} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { loginInfo, currentOrgId, currentOrgName } = state.login;

    return {
        currentOrgId,
        currentOrgName,
        loginInfo
    };
}

SellerTop.propTypes = {
    dispatch: PropTypes.func.isRequired,
    isOrg: PropTypes.number,
    loginInfo: PropTypes.object,
    currentOrgId: PropTypes.string,
    currentOrgName: PropTypes.string,
    prePath: PropTypes.string
};

export default connect(mapStateToProps)(SellerTop);
