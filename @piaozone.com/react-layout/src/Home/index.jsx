import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Button } from 'antd';

import AppTrees from './AppTrees';
import style from './index.less';

import addIcon from './add.png';
import radio from './radio.png';
import radioActive from './redioActive.png';

const propTypes = {
    apps: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string,
        name: PropTypes.string
    })).isRequired,
    news: PropTypes.arrayOf(PropTypes.shape({
        desc: PropTypes.string,
        number: PropTypes.number
    })).isRequired,
    handleAppClick: PropTypes.func.isRequired,
    handleAddApp: PropTypes.func.isRequired,
    handleNewsClick: PropTypes.func,

    modalData: PropTypes.shape({
        treeData: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string,
            title: PropTypes.string,
            children: PropTypes.arrayOf(PropTypes.shape({
                key: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number
                ]),
                title: PropTypes.string
            }))
        })),
        currentTreeApps: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string,
            isSelected: PropTypes.bool
        })),
        isShowAppSelectModal: PropTypes.bool,
        handleRadioChange: PropTypes.func.isRequired,
        handleModalOk: PropTypes.func.isRequired,
        handleModalCancel: PropTypes.func.isRequired,
        handleTreeSelect: PropTypes.func.isRequired
    })
};

function Home(props) {
    const { apps, news, handleAppClick, handleAddApp, handleNewsClick, modalData, ...restProps } = props;
    const { isShowAppSelectModal, treeData, currentTreeApps, handleRadioChange, handleModalOk, handleModalCancel, handleTreeSelect } = modalData;

    const onHandleAppClick = (app, index) => {
        if (handleAppClick) {
            handleAppClick(app, index);
        }
    };
    const onHandleAddClick = () => {
        if (handleAddApp) {
            handleAddApp();
        }
    };

    const onSelect = (keys, event) => {
        if (handleTreeSelect) {
            handleTreeSelect(keys, event);
        }
    };

    const handleOk = () => {
        if (handleModalOk) {
            handleModalOk();
        }
    };

    const handleCancel = () => {
        if (handleModalCancel) {
            handleModalCancel();
        }
    };

    const onHandleRadioClick = (flag, item, index) => {
        handleRadioChange(flag, item, index);
    };
    const onHandleNewsClick = (item, index) => {
        handleNewsClick(item, index);
    };
    
    return (
        <div className={style.home} {...restProps}>
            <div className={style.common}>
                <div className={style.title}>常用应用</div>
                <div className={style.apps}>
                    {
                        apps.map((app, index) => {
                            const { name, icon } = app;
                            return (
                                <div className={style.box} onClick={() => onHandleAppClick(app, index)} key={name}>
                                    <img className={style.icon} src={icon} alt={name} />
                                    <p className={style.name}>{name}</p>
                                </div>
                            );
                        })
                    }
                    <div className={style.box} onClick={onHandleAddClick}>
                        <img className={style.icon} src={addIcon} />
                        <p className={style.name}>增加</p>
                    </div>
                    
                </div>
            </div>
            {
                (news && news.length > 0) && (
                    <div className={classNames(style.common, style['news-container'])}>
                        <div className={style.title}>消息中心</div>
                        <div className={style.news}>
                            {
                                news.map((item, index) => {
                                    const { desc, number } = item;
                                    return (
                                        <div className={style.box} onClick={() => onHandleNewsClick(item, index)} key={`${index}-${number}`}>
                                            <p className={style.number}>{number}</p>
                                            <p className={style.status}>{desc}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                )
            }
            
            <Modal
                style={{ height: '580px' }}
                visible={isShowAppSelectModal}
                title='快速发起管理'
                onCancel={handleCancel}
                width={900}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button onClick={handleOk} type='primary'>
                        确定
                    </Button>
                ]}
                destroyOnClose
                bodyStyle={{ height: '460px', padding: '0' }}
            >   
                <div className='fpy-layout-modal'>
                    <div className='layout-tree-left'>
                        <AppTrees treeData={treeData} onSelect={onSelect} />
                    </div>
                
                    <div className={style['layout-tree-right']}>
                        {
                            currentTreeApps && currentTreeApps.map((app, index) => {
                                const { isSelected, title, icon } = app;
                                return (
                                    <div className={style.box} onClick={() => onHandleRadioClick(!isSelected, app, index)} key={title}>
                                        <img src={isSelected ? radioActive : radio} className={style.radio} />
                                        <img className={style.icon} src={icon} alt={title} />
                                        <p className={style.name}>{title}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
               
            </Modal>
        </div>
    );
}

Home.propTypes = propTypes;

export default Home;