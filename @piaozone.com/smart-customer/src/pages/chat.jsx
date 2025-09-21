/* eslint-disable max-len, no-unused-vars, no-console*/

import React, { useState, useEffect } from 'react';
import ChatHeader from '../components/ChatHeader';
import OnlyCharWithZhichi from './onlyChatWithZhichi';
import KefuAccess from '../components/KefuAccess';
import { handleUnLock, handleLock, checkWait } from '../utils/tools';
import DetailBox from '../components/DetailBox';
import axios from 'axios';
import myJq from 'jquery';
import '../css/chat.less';
import Questions from '../components/questions';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setAppAndModule } from '../store/appAndModule';

const SmartCustomerChat = ({ top = 48, right = 0, bottom = 0, appInfo = {} }) => {
    let apiBaseUrl = 'https://api.piaozone.com';
    const getAppAndModule = () => {
        let moduleEl = null;
        // 默认新版
        let version = 'v2';
        let appEl = document.querySelector('#homepagetabap .kd-cq-homepage-tab-item-active');
        if (appEl) {
            version = 'v1';
            moduleEl = document.querySelector('#tabap .kd-cq-tab-panel .kd-cq-tabs-tab .tab-active');
        } else {
            appEl = document.querySelector('#homepagetabap .kd-dropdown-trigger');
            moduleEl = document.querySelector('#homepagetabap .kd-cq-tabs li[data-active="true"]');
        }

        let appText = '';
        let moduleText = '';
        if (appEl) {
            appText = appEl.innerText;
        }
        if (moduleEl) {
            moduleText = moduleEl.innerText;
        }
        return {
            version,
            appText,
            moduleText
        };
    };
    if (appInfo.env === 'test') {
        apiBaseUrl = 'https://api-sit.piaozone.com/test';
    }
    const taxNo = appInfo.taxNo || '';
    const phone = appInfo.phone || '';
    const zhichiBaseUrl = 'https://piaozone.soboten.com/chat/frame/v6/entrance.js';
    const zhichiUrl = `${zhichiBaseUrl}?sysnum=1617b04db7e945d28a0fca2944f5409b`;
    // if (taxNo) {
    //     zhichiUrl = `${zhichiUrl}&partnerid=${taxNo}${phone}&enterprise_name=${taxNo}`;
    // }
    // 6 星瀚旗舰版，7为星空旗舰版
    const channelid = appInfo.version === 'CONSTELLATION' ? 6 : 7;

    const [showAccess, setShowAccess] = useState(false);
    const [visible, setVisible] = useState(false);
    const chatWidth = 420; // 聊天框宽度450
    const [detailWidth, setDetailWidth] = useState(0.7 * (document.documentElement.clientWidth - chatWidth));
    const smartHeaderHeight = 88; // 聊天框头部88
    const [activeIndex, setActiveIndex] = useState(-1); // 初始化状态
    const [detailInfo, setDetailInfo] = useState(null);
    const [chatHeight, setChatHeight] = useState(document.documentElement.clientHeight - top);
    const [infoList, setInfoList] = useState(null);
    const dispatch = useDispatch();
    const [allAppModuleInfo, setAllAppModuleInfo] = useState(null);
    // const appAndModuleInfo = useSelector((state) => state.appAndModule);

    useEffect(() => {
        const resize = () => {
            setChatHeight(Math.max(300, document.documentElement.clientHeight - top));
            setDetailWidth(0.7 * (document.documentElement.clientWidth - chatWidth));
        };
        window.addEventListener('resize', resize);
        return () => {
            // 旧版
            myJq('#homepagetabap').off('click', '.kd-cq-homepage-tab-item', updateAppAndModule);
            // myJq('#homepagetabap').off('click', '.kdfont-toubudaohang_guanbi', redirectUpdateAppAndModule);
            myJq('#tabap').off('click', '.kd-cq-tab-panel .kd-cq-tabs-tab', updateAppAndModule);
            // myJq('#tabap').off('click', '.kd-cq-tab-panel .kdfont-toubudaohang_guanbi', redirectUpdateAppAndModule);

            // 新版
            myJq(document).off('click', 'ul.kd-dropdown-menu .kd-cq-dropdown-menu-item', updateAppAndModule);
            myJq('#homepagetabap').off('click', '.kd-dropdown-trigger', updateAppAndModule);
            myJq('#homepagetabap').off('click', '.kd-cq-tabs li', updateAppAndModule);
            window.removeEventListener('resize', resize);
        };
    }, []);
    /*
    async function redirectUpdateApp() {
        const checkRes = await checkWait(() => {
            const newInfo = getAppAndModule();
            const stopFlag = (newInfo.appText !== appAndModuleInfo.appText);
            return {
                data: newInfo,
                stopFlag
            };
        });
        console.log('redirectUpdateApp', checkRes);
        if (checkRes.stopFlag) {
            dispatch(setAppAndModule(checkRes.data));
        }
    }

    async function redirectUpdateModule() {
        const checkRes = await checkWait(() => {
            const newInfo = getAppAndModule();
            const stopFlag = (newInfo.moduleText !== appAndModuleInfo.moduleText);
            return {
                data: newInfo,
                stopFlag
            };
        });
        console.log('redirectUpdateModule', checkRes);
        if (checkRes.stopFlag) {
            dispatch(setAppAndModule(checkRes.data));
        }
    }
    */
    function updateAppAndModule(e) {
        setTimeout(() => {
            const curObj = myJq(e.target);
            let newInfo = getAppAndModule();
            console.log('before updateAppAndModule----newInfo', newInfo);
            if (newInfo.version === 'v1') {
                if (curObj.hasClass('kd-cq-homepage-tab-item')) {
                    newInfo = {
                        ...newInfo,
                        appText: curObj.text()
                    };
                } else if (curObj.hasClass('kd-cq-tabs-tab')) {
                    const curText = curObj.text() || newInfo.appText;
                    newInfo = {
                        ...newInfo,
                        moduleText: curText
                    };
                }
            } else if (curObj.text().length > 1 && curObj.closest('.kd-cq-dropdown-menu-item').length !== 0) {
                newInfo = {
                    ...newInfo,
                    appText: curObj.text()
                };
            }
            console.log('updateAppAndModule----newInfo', newInfo);
            dispatch(setAppAndModule(newInfo));
        }, 200);
    }

    // 注册星瀚事件
    const registXingHanEvents = () => {
        // 旧版
        myJq('#homepagetabap').on('click', '.kd-cq-homepage-tab-item', updateAppAndModule);
        // myJq('#homepagetabap').on('click', '.kdfont-toubudaohang_guanbi', redirectUpdateAppAndModule);
        myJq('#tabap').on('click', '.kd-cq-tab-panel .kd-cq-tabs-tab', updateAppAndModule);
        // myJq('#tabap').on('click', '.kd-cq-tab-panel .kdfont-toubudaohang_guanbi', redirectUpdateAppAndModule);
        // 新版app选择
        myJq(document).on('click', 'ul.kd-dropdown-menu .kd-cq-dropdown-menu-item', updateAppAndModule);
        myJq('#homepagetabap').on('click', '.kd-dropdown-trigger', updateAppAndModule);
        // 新版moduel选择
        myJq('#homepagetabap').on('click', '.kd-cq-tabs li', updateAppAndModule);
    };

    // 查询文章列表
    const queryInfoList = async() => {
        const res = await axios.get(`${apiBaseUrl}/fpdk-gov/public/yuque/list-index.json`);
        if (res.data?.data?.body_sheet) {
            const body_sheet = JSON.parse(res.data?.data?.body_sheet);
            const listData = body_sheet.data[0].table;
            setInfoList(listData);
        }
    };

    const getAllAppAndModules = async() => {
        const res = await axios.get(`${apiBaseUrl}/fpdk-gov/public/yuque/appAndModule.json`);
        if (res.data?.data?.body_sheet) {
            const body_sheet = JSON.parse(res.data?.data?.body_sheet);
            const listData = body_sheet.data[0].table;
            const appModuleDict = {};
            for (let i = 1; i < listData.length; i++) {
                const item = listData[i];
                if (!appModuleDict[item[0]]) {
                    appModuleDict[item[0]] = [item[1]];
                } else {
                    appModuleDict[item[0]].push(item[1]);
                }
            }
            setAllAppModuleInfo({
                allBelongToAppList: Object.keys(appModuleDict),
                appModuleDict
            });
        }
    };

    // 显示与隐藏智能客服
    const displayCustomer = () => {
        const nextVisible = !visible;
        setVisible(nextVisible);
        const defaultFixed = sessionStorage.getItem('customer-fixed-default') || '1';
        if (nextVisible) {
            if (defaultFixed === '1') {
                handleLock();
            } else {
                handleUnLock();
            }
        } else {
            handleUnLock();
        }
    };

    // 隐藏智能客服
    const onClose = () => {
        setDetailInfo(null);
        setVisible(false);
        handleUnLock();
    };

    // 显示详情
    const showDetailBox = async(linkInfo) => {
        setDetailInfo(linkInfo);
    };

    // 智能客服与列表切换高度
    const togglerGroup = (flag) => {
        if (flag === 'info') {
            if (activeIndex === 1) {
                setActiveIndex(0);
            } else {
                setActiveIndex(1);
            }
            return;
        }
        if (activeIndex === 0) {
            setActiveIndex(1);
        } else {
            setActiveIndex(0);
        }
    };

    let infoListOutHeight = 140; // 初始化
    let chatOutHeight = chatHeight - smartHeaderHeight - infoListOutHeight - 2;
    const gapHeight = 2; // 折叠直接的宽度
    const groupFixedHeight = 46; // 折叠后的高度
    if (activeIndex === 0) { // 全部显示智能客服
        infoListOutHeight = groupFixedHeight;
        chatOutHeight = chatHeight - smartHeaderHeight - infoListOutHeight - 2;
    } else if (activeIndex === 1) { // 全部显示列表信息
        infoListOutHeight = chatHeight - smartHeaderHeight - groupFixedHeight - 2;
        chatOutHeight = groupFixedHeight;
    }

    // 智齿加载成功后显示
    const onLoadZhichi = () => {
        registXingHanEvents();
        getAllAppAndModules();
        queryInfoList();
        handleLock();
        setVisible(true);
        setShowAccess(true);
    };

    return (
        [
            <KefuAccess
                key='KefuAccess'
                displayCustomer={displayCustomer}
                display={showAccess}
            />,
            <div
                className='outerSmartCustomer'
                key='outerSmartCustomer'
                style={{
                    position: 'fixed',
                    top,
                    bottom,
                    width: detailInfo ? chatWidth + detailWidth : chatWidth,
                    right: visible ? right : -chatWidth
                }}
            >
                {
                    visible && (
                        <DetailBox
                            top={top}
                            bottom={bottom}
                            height={chatHeight}
                            right={detailInfo ? chatWidth : -detailWidth + chatWidth}
                            detailWidth={detailWidth}
                            detailInfo={detailInfo}
                            onClose={() => { setDetailInfo(null); }}
                        />
                    )
                }
                <div
                    className='innerSmartCustomerChat'
                    style={{
                        width: chatWidth
                    }}
                >
                    <ChatHeader
                        height={smartHeaderHeight}
                        onClose={onClose}
                    />
                    <Questions
                        allAppModuleInfo={allAppModuleInfo}
                        height={infoListOutHeight}
                        gapHeight={gapHeight}
                        togglerGroup={togglerGroup}
                        activeIndex={activeIndex}
                        groupFixedHeight={groupFixedHeight}
                        infoList={infoList}
                        showDetailBox={showDetailBox}
                    />

                    <div className='outGroup' style={{ height: chatOutHeight }}>
                        <div className='groupHeader' style={{ zIndex: 5 }}>
                            <span>智能客服</span>
                            <span
                                className={activeIndex === 1 ? 'icon closed' : 'icon'}
                                onClick={() => togglerGroup('kf')}
                            >
                                &nbsp;
                            </span>
                        </div>
                        <div
                            id='zhichiBox'
                            className='groupBox'
                            style={{
                                position: 'absolute',
                                overflow: 'hidden',
                                width: '100%',
                                top: smartHeaderHeight + infoListOutHeight + groupFixedHeight - 2,
                                height: chatOutHeight - groupFixedHeight + 2,
                                display: activeIndex === 2 ? 'none' : 'block',
                                zIndex: 0
                            }}
                        />
                        <OnlyCharWithZhichi
                            targetBoxId='zhichiBox'
                            zhichiUrl={zhichiUrl}
                            channelid={channelid}
                            partnerid={taxNo + '' + phone}
                            enterprise_name={taxNo}
                            onLoadZhichi={onLoadZhichi}
                        />
                    </div>
                </div>
            </div>
        ]
    );
};

SmartCustomerChat.propTypes = {
    appInfo: PropTypes.object
};

export default SmartCustomerChat;
