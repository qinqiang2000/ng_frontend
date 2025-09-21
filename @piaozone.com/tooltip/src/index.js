
/* eslint-disable */
// jquery方式添加提示悬浮框
import './style.less';

var __pwyToolTip = ({ selector = '', tipOuterCls = 'outerPwyTip', tipsCls = 'tipsText' }) => {
    if (!selector) {
        return false;
    }

    const getHtml = (tipHtml = '', id) => {
        return `
        <div style="position: absolute; top: 0px; left: 0px; width: 100%;z-index:9999 !important" class="${tipOuterCls}" id="${id}">
            <div class="pwyToolTip" style="left: 0; top: 0;visibility:hidden;">
                <div class="pwy-tooltip-content">
                    <div class="pwy-tooltip-arrow"></div>
                    <div class="pwy-tooltip-inner" style="max-height: 300px;overflow: auto;">
                        <div style="padding: 10px;">
                            ${tipHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    };

    let startTime; // 鼠标操作提示开始时间
    let endTime; // 鼠标操作提示结束时间
    let isEnter = false; // 是否进入onMouseenter事件
    let startX = 0; // 鼠标X左边
    let startY = 0; // 鼠标Y坐标
    let uid = ''; // 提示元素唯一id
    let selectorWidth = 0; // 元素宽度
    let selectorHeight = 0; // 元素高度

    const getUUId = () => {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return 'pwy-tool-tip-' + uuid;
    };

    const onMouseenter = (e) => {
        if (isEnter) {
            return;
        }
        isEnter = true;
        startTime = +new Date();
        endTime = +new Date();
        startX = e.pageX;
        startY = e.pageY;
        uid = getUUId();
        selectorWidth = $(selector).width();
        selectorHeight = $(selector).height();
        const bodyWidth = $(document).width();
        const bodyHeight = $(document).height();

        const el = $(e.target);
        const html = el.closest(selector).find('.' + tipsCls).html();
        const itemWidth = el.width();
        const itemHeight = el.height();
        const offset = el.offset();
        let arrowCls = 'leftTop';
        let isBottom = false;
        let isRight = false;
        const pos = {
            x: offset.left,
            y: offset.top + itemHeight + 10
        };


        const curHtml = getHtml(html, uid);
        $('body').append(curHtml);
        $('#' + uid + '.' + tipsCls).css({ display: 'block' });
        const contentEl = $('#' + uid + ' .pwy-tooltip-content');
        const boxWidth = contentEl.width();
        const boxHeight = contentEl.height();

        if (pos.y + boxHeight > bodyHeight) {
            pos.y = offset.top - boxHeight - itemHeight + 20;
            isBottom = true;
        }

        if (pos.x + boxWidth > bodyWidth) {
            pos.x = offset.left - boxWidth + itemWidth;
            isRight = true;
        }

        if (isBottom) {
            arrowCls = isRight ? 'bottomRight' : 'bottomLeft';
        } else {
            arrowCls = isRight ? 'topRight' : 'topLeft';
        }

        $('#' + uid + ' .pwy-tooltip-arrow').attr('class', 'pwy-tooltip-arrow ' + arrowCls);
        $('#' + uid + ' .pwyToolTip').css({ visibility: 'visible', top: pos.y + 'px', left: pos.x + 'px' });
    };

    const onMousemove = (e) => {
        if (!isEnter) {
            return;
        }
        const el = $(e.target);
        const tipEle = el.closest(selector);
        const tipBox = el.closest('.pwyToolTip');
        const duration = endTime - startTime;
        const moveX = Math.abs(e.pageX - startX);
        const moveY = Math.abs(e.pageY - startY);

        // 如果没有再指定的元素范围内
        if (tipEle.length === 0 && tipBox.length === 0) {
            // 移动距离比较小忽略
            if (moveX < 15 && moveY < 15) {
                endTime = +new Date();
            // 移动距离大于显示图标，或者移动时长超过800ms，
            } else if ((moveX > selectorWidth) || (moveY > selectorHeight) || duration > 800) {
                $('.' + tipOuterCls).remove();
                isEnter = false;
                startTime = +new Date();
                endTime = startTime;
            } else {
                endTime = +new Date();
            }
        }
    };

    const onMouseClick = (e) => {
        const el = $(e.target);
        const tipEle = el.closest(selector);
        const tipBox = el.closest('.pwyToolTip');
        if (tipEle.length === 0 && tipBox.length === 0) {
            $('.' + tipOuterCls).remove();
            isEnter = false;
        }
    }
    $(document).on('mouseenter', selector, onMouseenter);
    $(document).on('mousemove', onMousemove);
    $(document).on('mousemove', selector, onMousemove);
    $(document).on('click', onMouseClick);
    $(document).scroll(function() {
        $('.' + tipOuterCls).remove();
    });
    return true;
}

// 单例模式，只允许初始化一次
const pwyToolTip = (function initToolTip() {
    let isInit = false;
    return function create(opt) {
        if (isInit) {
            return true;
        }

        __pwyToolTip(opt);
        isInit = true;
        return true;
    };
})();

export default pwyToolTip;