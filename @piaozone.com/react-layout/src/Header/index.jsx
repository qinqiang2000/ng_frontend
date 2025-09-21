import React, { useState, useRef } from 'react';
import { Avatar, Input, Divider, Dropdown, Icon, Tabs } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './index.less';

import closeActive from './closeActive.png';
import search from './search.png';
import close from './close.png';
import logo from './icon.png';

const { TabPane } = Tabs;

const propTypes = {
    userInfo: PropTypes.shape({
        name: PropTypes.string,
        avatarSrc: PropTypes.string,
        handleClickAvatar: PropTypes.func
    }),
    currentKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    handleClickTabs: PropTypes.func,
    handleChangeSearchInp: PropTypes.func,
    handleClickCloseTab: PropTypes.func, // 关闭按钮
    tabsFixed: PropTypes.array, // 固定的tabs
    tabsTemp: PropTypes.array, // 当前打开的tabs
    searchInputAttribute: PropTypes.object, // antd input 其他属性
    overlay: PropTypes.func, // 参考antd Dropdown overlay 参数
};

const defaultProps = {
    userInfo: {}
};

function Header(props) {
    const inputEl = useRef(null);
    const [searchClass, setSearchClass] = useState(style.search);
    const [inpValue, setInpValue] = useState('');

    // const [closeStyle, setCloseStyle] = useState(style.close);
    const [blurCloseIndex, setBlurCloseIndex] = useState(-1);

    const { tabsFixed, tabsTemp, userInfo, searchInputAttribute, handleClickCloseTab,
         handleClickTabs, handleChangeSearchInp, currentKey, overlay, restNode, logoImg,
         ...restProps } = props;
    const { name, avatarSrc, handleClickAvatar } = userInfo;

    const allTabs = tabsFixed.concat(tabsTemp)

    const onHandleChange = (e) => {
        setInpValue(e.target.value);
        if (handleChangeSearchInp) {
            handleChangeSearchInp(e);
        }
    };

    const onHandleBlur = () => {
        if (searchClass !== style.search && !inpValue) {
            setSearchClass(style.search);
        }
    };

    const onHandleMouSEOver = () => {
        if (searchClass === style.search) {
            setSearchClass(classNames(style.search, style['search-hover']));
            inputEl.current.focus();
        }
    };

    const onHandleChangeTabs = (key) => {
        const index = allTabs.findIndex(item => item.key == key);
        if (handleClickTabs) {
            handleClickTabs(key, allTabs[index], index);
        }
    };

    const onHandleClickAvatar = () => {
        if (handleClickAvatar) {
            handleClickAvatar();
        }
    };

    // const onHandleMouSEOverClose = (index) => {
    //     if (closeStyle === style.close) {
    //         setBlurCloseIndex(index);
    //         setCloseStyle(classNames(style.close, style.closeActive));
    //     }
    // };
    // const onHandleMouSEOutClose = () => {
    //     if (closeStyle !== style.close) {
    //         setCloseStyle(classNames(style.close));
    //     }
    // };

    const onHandleMouSEOverTab = (index) => {
        setBlurCloseIndex(index);
    };

    const onHandleMouSEOutTab = () => {
        // if (closeStyle === style.close) {
            setBlurCloseIndex(-1);
        // }
    };

    const onHandleClickCloseTab = (e, key, item, index) => {
        e.stopPropagation();
        e.cancelBubble = true;
        if (handleClickCloseTab) {
            handleClickCloseTab(key, item, index);
        }
    };

    const renderContentTab = (item, index, currentKey) => {
        const { title, key } = item;
        const imgStyle = {
            visibility: `${blurCloseIndex === index ? 'visible' : 'hidden'}`
        }
        const titleStyle = {
            color: key == currentKey ? '#FFF' : '#212121',
        }
        const contentStyle = {
            background: key == currentKey ? '#5582F3' : '#FFF',
        }
        return (
            <div className="klayout-header-tab-content"
                style={{ ...contentStyle }}
                onMouseOver={() => onHandleMouSEOverTab(index)}
                onMouseOut={() => onHandleMouSEOutTab(index)}
            >
                <div style={titleStyle}>{title}</div>
                <img 
                    className="close-img"
                    style={{...imgStyle}} 
                    src={currentKey == key ? closeActive : close} alt="关闭" 
                    onClick={(e) => onHandleClickCloseTab(e, key, item, index)}
                />
            </div>
        )
    }

    return (// 
        <div className={style.header} {...restProps}>
            <div className={style['base-tabs']}>
                <div className={style.logo}>
                    <img src={logoImg || logo} className={style.img} />
                    <p className={style.title}>影像归档系统</p>
                </div>
                 
                
                <div className={classNames(style.menus, 'klayout-header-tab')}>
                    {
                        tabsFixed.map((item, index) => {
                            const { key, title } = item;
                            const styles = classNames(style.tab, {
                                [style.active]: currentKey == key
                            });
                            return (
                                <div key={key} className={styles} onClick={() => onHandleChangeTabs(key)}>{title}</div>
                            );
                        })
                    }
                    {
                        tabsFixed && tabsFixed.length > 0 && (<Divider type='vertical' style={{ height: '26px', margin: 0 }} />)
                    }
                    {/* {
                        tabsTemp.map((item, index) => {
                            const { key, title } = item;
                            const styles = classNames(style.tab, {
                                [style.active]: currentKey === key
                            });
                            return (
                                <div
                                    className={style.container} 
                                    onMouseEnter={() => onHandleMouSEOverTab(index)}
                                    onMouseOut={() => onHandleMouSEOutTab(index)}
                                    key={key}
                                >
                                    {
                                        blurCloseIndex === index && (<img
                                            className={closeStyle} 
                                            src={currentKey === key ? closeActive : close}
                                            onMouseEnter={() => onHandleMouSEOverClose(index)}
                                            onMouseOut={() => onHandleMouSEOutClose(index)}
                                            onClick={() =>onHandleClickCloseTab(key, item, index)}
                                        />)
                                    }
                                    <div className={styles} key={key} onClick={() => onHandleChangeTabs(key, item, index)}>{title}</div>
                                </div>
                            );
                        })
                    } */}
                    <Tabs activeKey={currentKey} tabPosition="top" animated={false} style={{ height: 52, maxWidth: 600 }} onTabClick={onHandleChangeTabs}>
                        {tabsTemp.map((item, index) => (   
                            <TabPane tab={renderContentTab(item, index, currentKey)} key={item.key}></TabPane>
                        ))}
                    </Tabs>
                </div>

            </div>
            <div className={style.info}>
                {
                    restNode && (
                        <div className={style.restNode}>{ restNode }</div>
                    )
                }
                {
                    handleChangeSearchInp && (
                        <div className={searchClass}>
                            <img src={search} className={style.icon} onMouseEnter={onHandleMouSEOver} />
                            <Input ref={inputEl} onChange={onHandleChange} onBlur={onHandleBlur} className={style.input} {...searchInputAttribute} />
                        </div>
                    )
                }
                <div className={style.user}>
                    <p className={style.name}>{name}</p>
                    {
                        avatarSrc && (<Avatar className={style.icon} src={avatarSrc} onClick={onHandleClickAvatar} />)
                    }
                </div>

                {
                    overlay && (
                        <Dropdown overlay={() => overlay()}>
                            <a href='#' style={{ lineHeight: '52px'}}>
                                <Icon type='caret-down' theme='filled' />
                            </a>
                        </Dropdown>
                    )
                }
                
            </div>
        </div>
    );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;