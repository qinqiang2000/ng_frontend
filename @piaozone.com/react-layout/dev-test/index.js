import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Menu, Select } from 'antd';
import Layout from '../src';
import './style.css';
import achiveBg from './achiveBg.png';
import huifulogo from './huifulogo.png';

const { Option } = Select;
const { Header, Content, Home, Apps } = Layout;

const tabsFixed = [
    { key: 1, title: '首页' },
    { key: 2, title: '应用' },
];

const tabsTemp = [
    { key: 3, title: '会计档案室' },
    { key: 4, title: '归档检测' },
    { key: 5, title: '归档检测' },
    // { key: 5, title: '异构系统' },
    // { key: 6, title: '异构系统异构' },
]

const commonUseApps = [
    {
        name: '麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪麦迪麦迪麦迪麦迪麦迪麦迪麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪麦迪麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪麦',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
    {
        name: '麦迪麦迪麦迪',
        icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
    },
];
const news = [
    {
        number: 100,
        desc: '待确认',
    },
    {
        number: 200,
        desc: '待确认',
    },
    {
        number: 300,
        desc: '待确认',
    },
    {
        number: 400,
        desc: '待确认',
    },
]

const systems = [
    {
        img: achiveBg,
        name: '归档系统',
        modules: [
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源'
            },
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源，数据源，数据源，数据源，数据源'
            },
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源'
            }
        ]
    },
    {
        img: achiveBg,
        name: '归档系统',
        modules: [
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源'
            },
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源，数据源，数据源，数据源，数据源'
            },
            {
                icon: 'https://img2.baidu.com/it/u=2955317269,3290234606&fm=26&fmt=auto&gp=0.jpg',
                title: '异构系统',
                desc: '单据，数据源'
            }
        ]
    }
]

const treeData = [
    // {
    //     key: 4, 
    //     title: '应用模块', 
    //     children: [
            {
                key: 1, 
                title: '归档系统', 
            },
            {
                key: 2, 
                title: '影像系统', 
                children: []
            },
            {
                key: 3, 
                title: '3', 
                children: []
            }
    //     ]
    // }
   
]

const currentTreeApps = [
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: false,
    },
    {
        title: '异构系统异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统异构',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
    {
        title: '异构系统异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
   
    {
        title: '异构系统',
        icon: 'https://ierp.kingdee.com/ierp/icons/pc/entrance/default_48_48.png?v=1.0',
        isSelected: true,
    },
]

const userInfo = {
    name: '比尔盖茨',
    // avatarSrc: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    // handleClickAvatar: () => {
    //     console.log('--handleClickAvatar--')
    // },
}



function Test() {
    const [ currentTreeApp, setCurrentTreeApp ] = useState(currentTreeApps);
    const [ cTabsTemp, setCTabsTemp ] = useState([...tabsTemp]);
    const [ isShowAppSelect, setIsShowAppSelect ] = useState(false);
    const [ currentKey, setCurrentKey ] = useState(tabsFixed[0].key);

    const handleRadioChange = (flag, item, index) => {
        console.log(flag, item, index, '-handleRadioChange--')
        currentTreeApp[index].isSelected = flag;
        setCurrentTreeApp([...currentTreeApp]);
    }
    const handleModalOk = () => {
        setIsShowAppSelect(false)
    }
    const handleModalCancel = () => {
        setIsShowAppSelect(false)
    }
    const handleAddApp = () => {
        console.log('--handleAddApp--')
        setIsShowAppSelect(true)
    }
    const handleAppClick = (app, index) => {
        // setIsShowAppSelect(true)
        console.log('--handleAppClick--', app, index);
        setCTabsTemp(cTabsTemp.concat([{ key: 11, title: '异构系统' }]))
    }
    const handleTreeSelect = (keys, event) => {
        // setIsShowAppSelect(true)
        console.log('--handleSelect--', keys, event);
    }

    const operate = ({ item, key, keyPath, domEvent }) => {
        console.log({ item, key, keyPath, domEvent })
    }

    const overlay = () => {
        return (
            <Menu onClick={operate}>
                <Menu.Item key='edit'>修改密码</Menu.Item>
                <Menu.Item key='about'>关于我们</Menu.Item>
                <Menu.Item key='logout'>退出登录</Menu.Item>
            </Menu>
        );
    }

    const onSelectChange = (value) => {
        console.log(value);
    }
    const restNode = () => {
        const bookList = [
            {
                fid: 11,
                fbookName: '发顺丰'
            },
            {
                fid: 12,
                fbookName: 'sdfsd双丰收'
            },
            {
                fid: 13,
                fbookName: '水电费打算复读'
            }
        ]
        return (
            <div
                className="dd"
                // onMouseLeave={() => this.setState({ isShowTree: false })}
            >
                <Select onChange={onSelectChange} style={{ minWidth: 120 }}>
                    {bookList.map((itm) => {
                        return <Option value={itm.fid.toString()}>{itm.fbookName}</Option>;
                    })}
                </Select>
            </div>
        )
    }


    console.log(huifulogo, '--huifulogo---')
    return(
        <Layout className='myCom'>
            <Header 
                tabsFixed={tabsFixed}
                tabsTemp={cTabsTemp}
                currentKey={currentKey}
                userInfo={userInfo}
                searchInputAttribute={{
                    onPressEnter: (e) => {
                        console.log(e);
                    }
                }}
                handleClickCloseTab={() => {
                    console.log('-handleClickCloseTab-');
                }}
                handleClickTabs={(key, item, index) => {
                    setCurrentKey(key)
                    console.log('-handleClickTabs-', key, item, index);
                }}
                overlay={overlay}
                restNode={restNode()}
                // logoImg={huifulogo}
                // handleChangeSearchInp={(e) => {
                //     console.log(e.target.value, '-handleChangeSearchInp-');
                // }}
            />
            <Content>
                <Home 
                    apps={commonUseApps} 
                    news={news}
                    handleAppClick={handleAppClick}
                    handleAddApp={handleAddApp}
                    handleNewsClick={(item, index) => {
                        console.log('--handleNewsClick--', item, index)
                    }}
                    modalData={{
                        treeData,
                        currentTreeApps: currentTreeApp,
                        handleRadioChange,
                        isShowAppSelectModal: isShowAppSelect,
                        handleModalOk,
                        handleModalCancel,
                        handleTreeSelect,
                    }}
                />
                {/* <Apps systems={systems} handleModuleClick={(systemKey, currentModule, currentIndex) => {console.log(systemKey, currentModule, currentIndex)}} /> */}
            </Content>
        </Layout>
    )
}

ReactDOM.render((
   <Test/>
), document.getElementById('root'));