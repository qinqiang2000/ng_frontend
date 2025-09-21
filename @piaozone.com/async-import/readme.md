# 组件文档描述

```js

import asyncImport from '@piaozone.com/async-import';

const TestCom = asyncImport(() => import('./testCom'), {
    className: '', // 可选，加载异常时控制显示的class
    Loading: (props) => { // 可选，不传时直接使用默认的加载效果
        return (
            <div {...props}>加载中...</div>
        );
    },
    loadingProps: {  // 可选，传递加载组件时，需要传递的参数
        className: 'loading'
    },
    delayTime: 2000 // 可选，默认为0，控制加载延迟时间
});

```