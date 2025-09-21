# 预览文件组件

```js

import Diagram from '@piaozone.com/diagram';

export default function Test() {
    const { vertexList, edgeList } = data;

    const handleClickDot = (value) => {
        console.log(value, 'value--------------------');
    }

    return (
        <Diagram
            contentWidth={1055} // 内容宽
            contentHeight={569} // 内容高
            dotList={vertexList} // 点的合集
            lineList={edgeList} // 线的合集
            handleClickDot={handleClickDot} // 点击点的回调函数
        />
    )
};

```

