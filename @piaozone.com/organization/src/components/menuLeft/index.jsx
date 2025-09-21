import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import PropTypes from 'prop-types';
import './menuLeft.css';
import { message } from 'antd';
import menuConfig from './menuConfig';

function toggleFolder(i, openStatus, e, dispatch) {
    dispatch({
        type: 'menu/folderStatus',
        payload: { openStatus, index: i }
    });
    e?.preventDefault();
    return false;
}

function findMenu(arr, name) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].menuCode === name) {
            return true;
        }
    }
    return false;
}

function getFolderCls(activeFolder, openStatus) {
    const tempArr = ['folder', 'level1'];
    if (activeFolder) {
        tempArr.push('activeFolder');
    }

    if (openStatus) {
        tempArr.push('open');
    } else {
        tempArr.push('close');
    }

    return tempArr.join(' ');
}

function preSetCurrentPage(pageId, dispatch) {
    toggleFolder(false, false, null, dispatch);
    dispatch({
        type: 'pages/changeCurrentPage',
        payload: {
            pageId
        }
    });
}

function findMenuByCurrentPage(sonMenu, currentPage) {
    for (const menu of Object.values(sonMenu)) {
        if (menu.path === currentPage) {
            return true;
        }
    }
    return false;
}

function MenuLeft(props) {
    const { menuInfo, prePath = '/portalweb/web', dispatch, pageName, currentPage } = props;
    const pNames = pageName.split('-');
    const pName = pNames[0];
    const subPname = pNames[1];

    if (menuInfo.length === 0) {
        dispatch({ type: 'menu/getMenuInfo', payload: {} })
            .then(menuRes => {
                if (menuRes.errcode !== '0000') {
                    message.info(menuRes.description);
                }
            });
        return null;
    }

    return (
        <div
            className='newMenuLeft'
        >
            {menuInfo.map((itemData, i) => {
                // menuCode与menuConfig.js中的key对应
                const cname = itemData.menuCode;
                const mainConfig = menuConfig[cname];

                //没有配置
                if (!mainConfig || mainConfig.status === 3) {
                    return null;
                }

                const mainStatus = mainConfig.status;

                const activeFolder =
                    (pName === cname && findMenu(itemData.childList, subPname)) || findMenuByCurrentPage(mainConfig.children, currentPage);

                //有配置且状态为1正常
                if (mainStatus === 1) {
                    const openStatus = itemData.openStatus || false;
                    return (
                        <div
                            key={itemData.id}
                            className={getFolderCls(activeFolder, openStatus)}
                            onMouseEnter={e => toggleFolder(i, true, e, dispatch)}
                            onMouseLeave={e => toggleFolder(i, false, e, dispatch)}
                        >
                            <div
                                className='title'
                            >
                                <img className='menuIcon' src={mainConfig.icon} alt='' style={{ minWidth: 16, minHeight: 17 }} />
                                <span className='name'>{mainConfig.name}</span>
                            </div>
                            <ul className='subList level2'>
                                {itemData.childList.map((childrenData, j) => {
                                    const subName = childrenData.menuCode;

                                    const subConfig = mainConfig.children[subName];
                                    if (!subConfig || subConfig.status === 3) {
                                        return null;
                                    }
                                    const subStatus = subConfig.status;

                                    if (subStatus === 1) {
                                        const operateUrl = prePath + subConfig.path;
                                        return (
                                            <li key={childrenData.id}>
                                                <Link
                                                    className={(subName === subPname || subConfig.path === currentPage) ? 'active' : ''}
                                                    onClick={() => preSetCurrentPage(subConfig.path, dispatch)}
                                                    to={operateUrl}
                                                >
                                                    {subConfig.name}
                                                </Link>
                                            </li>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                            </ul>
                        </div>
                    );
                } else {
                    return null;
                }
            })}
        </div>
    );
}

function mapStateToProps(state) {
    const { menuInfo } = state.menu;
    const { currentPage } = state.pages;

    return {
        menuInfo,
        currentPage
    };
}

MenuLeft.propTypes = {
    currentPage: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    menuInfo: PropTypes.array,
    prePath: PropTypes.string,
    pageName: PropTypes.string
};

export default connect(mapStateToProps)(MenuLeft);
