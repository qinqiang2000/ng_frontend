
# 影像归档项目首页应用组件

## 总共包含五个组件 Layout、Header、Content、Home、Apps


### 使用方法
```bash

# 当前项目内安装
$ npm install @piaozone.com/react-layout

import Layout from '@piaozone.com/react-layout';
const { Header, Content, Home, Apps } = Layout;

```

#### Layout
1. 使用了antd的layout，参数与antd一致

#### Header
1. 作为layout的children
2. 接受多个参数，如下 

```bash

# 固定的tabs
tabsFixed: PropTypes.array
# 当前打开的tabs
tabsTemp: PropTypes.array

# 当前头部选中的tab
currentKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
]).isRequired

# tab点击事件
handleClickTabs: PropTypes.func.isRequired,
#  关闭tab按钮
handleClickCloseTab: PropTypes.func


# 头部右边用户信息
userInfo: PropTypes.shape({
    name: PropTypes.string,
    avatarSrc: PropTypes.string,
    handleClickAvatar: PropTypes.func
})

# 右边搜索框，不填不显示
handleChangeSearchInp: PropTypes.func
# 右边搜索框 antd input 其他属性
searchInputAttribute: PropTypes.object

# 参考antd Dropdown overlay 参数
overlay: PropTypes.func

```

#### Content
1. 作为layout的children
2. 接受children以及className的属性

#### Home
1. 作为Content的children
2. 分为三个模块
    - 快捷应用
    - 消息中心
    - 添加快捷应用
2. 接受多个参数，如下

```bash
# 快捷应用
apps: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    name: PropTypes.string
})).isRequired
handleAppClick: PropTypes.func.isRequired,

# 消息中心
news: PropTypes.arrayOf(PropTypes.shape({
    desc: PropTypes.string,
    number: PropTypes.number
})).isRequired,
handleNewsClick: PropTypes.func,

# 点击添加快捷应用按钮 点击事件，需要把modalData.isShowAppSelectModal 设置为true
handleAddApp: PropTypes.func.isRequired,

# 添加快捷应用
modalData: PropTypes.shape({
    # 系统模块树，最多两层
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
    }))

    # 选择某个系统模块 点击事件
    handleTreeSelect: PropTypes.func.isRequired

    # 当前模块包含的应用
    currentTreeApps: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string,
        title: PropTypes.string,
        isSelected: PropTypes.bool
    }))
    # 显示添加快捷应用的弹窗
    isShowAppSelectModal: PropTypes.bool,
    # 选择快捷应用
    handleRadioChange: PropTypes.func.isRequired,
    # 确定
    handleModalOk: PropTypes.func.isRequired,
    # 取消
    handleModalCancel: PropTypes.func.isRequired,
})

```


#### Applications
1. 作为layout的children
2. 接受多个参数，如下

```bash
# 系统模块
systems: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    img: PropTypes.string,
    modules: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string,
        title: PropTypes.string,
        desc: PropTypes.string
    }))
})).isRequired

# 应用的点击事件
handleModuleClick: PropTypes.func.isRequired

```

## tip
1. 本组件没有对less做预处理，需要在使用的项目中做处理
2. 更详细的使用看dev-test下的demo