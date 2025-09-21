import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../css/kefuAccess.less';

const kefuIcon = require('../img/kefu_icon.png');

const KefuAccess = ({ displayCustomer, display }) => {
    const [position, setPosition] = useState({ x: 40, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);
    const [mouseDownTime, setMouseDownTime] = useState(0);
    const [shouldTriggerClick, setShouldTriggerClick] = useState(true);
    const elementRef = useRef(null);

    // 获取可见区域尺寸
    const getViewportSize = () => {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    // 限制位置在可见范围内
    const constrainPosition = (x, y) => {
        const viewport = getViewportSize();
        const elementSize = 48; // 根据CSS中的实际大小

        return {
            x: Math.max(0, Math.min(x, viewport.width - elementSize)),
            y: Math.max(0, Math.min(y, viewport.height - elementSize))
        };
    };

    // 计算两点之间的距离
    const getDistance = (point1, point2) => {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // 鼠标按下事件
    const handleMouseDown = (e) => {
        if (e.button !== 0) { // 只响应左键
            return;
        }

        const startPos = { x: e.clientX, y: e.clientY };

        setDragStart(startPos);
        setStartPosition(position); // 记录开始拖动时的元素位置
        setHasMoved(false);
        setIsDragging(true);
        setShouldTriggerClick(true); // 初始时允许点击
        setMouseDownTime(Date.now()); // 记录鼠标按下时间
        e.preventDefault();
        e.stopPropagation();
    };

    // 鼠标移动事件
    const handleMouseMove = (e) => {
        if (!isDragging) {
            return;
        }

        // 检查是否移动了足够距离才开始拖动
        const currentPos = { x: e.clientX, y: e.clientY };
        const distance = getDistance(dragStart, currentPos);

        if (!hasMoved && distance > 5) { // 移动超过5px才开始拖动
            setHasMoved(true);
            setShouldTriggerClick(false); // 开始拖动后禁用点击
        }

        if (hasMoved) {
            // 计算鼠标移动的距离
            const deltaX = currentPos.x - dragStart.x;
            const deltaY = currentPos.y - dragStart.y;

            // 对于right定位，向右移动时right值减小，向左移动时right值增大
            // 对于bottom定位，向下移动时bottom值减小，向上移动时bottom值增大
            const newX = startPosition.x - deltaX; // 注意这里是减法
            const newY = startPosition.y - deltaY; // 注意这里是减法

            const constrainedPosition = constrainPosition(newX, newY);
            setPosition(constrainedPosition);
        }
    };

    // 鼠标松开事件
    const handleMouseUp = () => {
        setIsDragging(false);
        setHasMoved(false);
        // 延迟重置shouldTriggerClick，确保点击事件检查完成
        setTimeout(() => {
            setShouldTriggerClick(true);
        }, 100);
    };

    // 点击事件处理
    const handleClick = (e) => {
        const clickTime = Date.now();
        const timeDiff = clickTime - mouseDownTime;

        // 只有真正的点击才触发：没有移动过、时间间隔很短、且允许点击
        if (!hasMoved && timeDiff < 200 && shouldTriggerClick) {
            displayCustomer(e);
        }
    };

    // 添加全局鼠标事件监听
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, hasMoved, dragStart, startPosition]);

    // 窗口大小改变时重新约束位置
    useEffect(() => {
        const handleResize = () => {
            const constrainedPosition = constrainPosition(position.x, position.y);
            setPosition(constrainedPosition);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [position]);

    if (!display) {
        return null;
    }

    return (
        <div
            ref={elementRef}
            className='smartCustomerAccess'
            style={{
                position: 'fixed',
                bottom: `${position.y}px`,
                right: `${position.x}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
            }}
        >
            <img
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                src={kefuIcon}
                alt=''
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            />
            <span className='accessTip'>咨询在线客服</span>
        </div>
    );
};

KefuAccess.propTypes = {
    displayCustomer: PropTypes.func,
    display: PropTypes.bool
};

export default KefuAccess;
