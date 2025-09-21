import React from 'react';
import PropTypes from 'prop-types';
import Loading from './loading';
import { useSelector } from 'react-redux';

const Questions = (props = {}) => {
    const {
        allAppModuleInfo,
        showDetailBox,
        infoList,
        height,
        gapHeight,
        groupFixedHeight,
        activeIndex,
        togglerGroup
    } = props;
    const appAndModuleInfo = useSelector((state) => state.appAndModule);
    const getFilertList = (allList, appAndModuleInfo2) => {
        const tempList = [];
        const { appText, moduleText } = appAndModuleInfo2;
        const appModuleDict = allAppModuleInfo?.appModuleDict || {};
        const allBelongToAppList = allAppModuleInfo?.allBelongToAppList || [];
        const allBelongToModule = appText ? appModuleDict[appText] : [];

        for (let i = 1; i < allList.length; i++) {
            const item = allList[i];
            const belongToApp = item[1] || '';
            const belongToModule = item[2] || '';
            const link = item[3];
            if (!link) {
                continue;
            }
            const appIsNotMatch = (belongToApp === '' || appText === '' || !allBelongToAppList.includes(appText));
            const moduleIsMath = (
                belongToApp.indexOf(appText) !== -1 &&
                (belongToModule === '' || moduleText === '' || !allBelongToModule.includes(moduleText) || belongToModule.includes(moduleText))
            );

            if (appIsNotMatch || moduleIsMath) {
                tempList.push({
                    questionType: item[0],
                    belongToApp,
                    belongToModule,
                    link: link,
                    title: item[4],
                    createTime: item[5],
                    frequency: item[6]
                });
            }
        }
        return tempList;
    };
    const getFilterListElements = (infoListArg, appAndModuleInfoArg) => {
        const filterList = getFilertList(infoListArg, appAndModuleInfoArg);
        if (filterList.length > 0) {
            return filterList.map((item, i) => {
                // 初始状态显示3个
                if (activeIndex === -1 && i > 2) {
                    return null;
                }
                const questionType = item.questionType;
                let questionTag = 'icon';
                if (questionType === '热门') {
                    questionTag = 'icon rm';
                } else if (questionType === '政策') {
                    questionTag = 'icon zc';
                } else if (questionType === '通知' || questionType === '开票通知' || questionType === '收票通知') {
                    questionTag = 'icon tz';
                } else if (questionType === '问题' || questionType === '问答') {
                    questionTag = 'icon wt';
                }
                return (
                    <p key={item.title}>
                        <span className={questionTag}>&nbsp;</span>
                        <a
                            href='#'
                            title={item.title}
                            onClick={() => {
                                showDetailBox(item);
                            }}
                        >
                            {item.title}
                        </a>
                    </p>
                );
            });
        }
        return (
            <div className='empty'>
                <p>暂无数据</p>
            </div>
        );
    };

    return (
        <div className='outGroup' style={{ height }}>
            <div className='groupHeader' style={{ borderBottom: gapHeight + 'px solid #fff' }}>
                <span>通知/政策/问答</span>
                <span
                    className={activeIndex === 1 ? 'icon' : 'icon closed'}
                    onClick={() => togglerGroup('info')}
                >
                        &nbsp;
                </span>
            </div>
            <div
                className='infoList groupBox'
                style={{
                    height: height - groupFixedHeight
                }}
            >
                <Loading loading={!infoList || !allAppModuleInfo} />
                {
                    infoList && allAppModuleInfo && getFilterListElements(infoList, appAndModuleInfo)
                }
            </div>
        </div>
    );
};

Questions.propTypes = {
    allAppModuleInfo: PropTypes.object,
    infoList: PropTypes.array,
    togglerGroup: PropTypes.func.isRequired,
    height: PropTypes.number,
    groupFixedHeight: PropTypes.number.isRequired,
    gapHeight: PropTypes.number.isRequired,
    activeIndex: PropTypes.number.isRequired,
    showDetailBox: PropTypes.func.isRequired
};

export default Questions;
