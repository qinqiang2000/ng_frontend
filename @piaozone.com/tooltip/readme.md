

# 组件文档描述

**内部依赖jquery, 实现悬浮提示，目前只是提供给苍穹自定义控件使用**

```html
    <div style="display:inline-block;" class="outTipsText">
        <img
            class="tipIcon"
            src="https://feature.kingdee.com:1026/devscm/icons/pc/state/remind_28_28.png"
        />
        <div class="tipsText" style="display: none">
            悬浮提示内容
        </div>
    </div>
```

```js
    pwyToolTip({
        selector: '.outTipsText', // 鼠标移动到指定的选择器触发悬浮提示
        tipOuterCls: 'outerPwyTip', // 悬浮框自定义class, 非必须，默认为outerPwyTip
        tipsCls: 'tipsText' // 需要悬浮提示的子元素class，非必须，默认为tipsText
    });
```

