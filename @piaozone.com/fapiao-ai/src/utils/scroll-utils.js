/**
 * 滚动工具函数
 */

/**
 * 将 fapiaoAiChatList 滚动到底部
 * @param {Object} options - 滚动选项
 * @param {boolean} options.smooth - 是否平滑滚动，默认为 true
 * @param {string} options.selector - 自定义选择器，默认为 '.fapiaoAiChatList'
 * @returns {boolean} 滚动是否成功
 */
export function scrollChatListToBottom(options = {}) {
    const {
        smooth = true,
        selector = '.fapiaoAiChatList'
    } = options;

    // 查找聊天列表元素
    const chatListElement = document.querySelector(selector);

    if (!chatListElement) {
        console.warn(`找不到元素: ${selector}`);
        return false;
    }

    try {
        // 方法1: 使用 scrollTo (推荐)
        chatListElement.scrollTo({
            top: chatListElement.scrollHeight,
            behavior: smooth ? 'smooth' : 'instant'
        });

        return true;
    } catch (error) {
        // 方法2: 降级到 scrollTop (兼容性更好)
        try {
            if (smooth) {
                // 平滑滚动的降级实现
                smoothScrollTo(chatListElement, chatListElement.scrollHeight);
            } else {
                chatListElement.scrollTop = chatListElement.scrollHeight;
            }
            return true;
        } catch (fallbackError) {
            console.error('滚动失败:', fallbackError);
            return false;
        }
    }
}

/**
 * 平滑滚动的降级实现
 * @param {Element} element - 要滚动的元素
 * @param {number} targetScrollTop - 目标滚动位置
 * @param {number} duration - 动画持续时间(毫秒)
 * @returns {void} 无返回值
 */
function smoothScrollTo(element, targetScrollTop, duration = 300) {
    const startScrollTop = element.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const startTime = performance.now();

    function animation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用 easeInOutCubic 缓动函数
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        element.scrollTop = startScrollTop + distance * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

/**
 * 将最后一个聊天消息滚动到可视区域
 * @param {Object} options - 滚动选项
 * @param {boolean} options.smooth - 是否平滑滚动
 * @param {string} options.chatListSelector - 聊天列表选择器
 * @param {string} options.messageSelector - 消息选择器
 * @returns {boolean} 滚动是否成功
 */
export function scrollToLastMessage(options = {}) {
    const {
        smooth = true,
        chatListSelector = '.fapiaoAiChatList',
        messageSelector = '.chat-message, .message-item, [class*="message"]' // 通用消息选择器
    } = options;

    const chatListElement = document.querySelector(chatListSelector);
    if (!chatListElement) {
        console.warn(`找不到聊天列表元素: ${chatListSelector}`);
        return false;
    }

    // 查找最后一个消息元素
    const messageElements = chatListElement.querySelectorAll(messageSelector);
    const lastMessage = messageElements[messageElements.length - 1];

    if (!lastMessage) {
        console.warn('找不到消息元素');
        // 降级到滚动到底部
        return scrollChatListToBottom(options);
    }

    try {
        // 将最后一个消息滚动到可视区域
        lastMessage.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant',
            block: 'end',
            inline: 'nearest'
        });
        return true;
    } catch (error) {
        console.error('滚动到最后消息失败:', error);
        // 降级到滚动到底部
        return scrollChatListToBottom(options);
    }
}

/**
 * 检查是否已经滚动到底部
 * @param {string} selector - 元素选择器
 * @param {number} threshold - 阈值(像素)，默认为 5px
 * @returns {boolean} 是否在底部
 */
export function isScrolledToBottom(selector = '.fapiaoAiChatList', threshold = 5) {
    const element = document.querySelector(selector);
    if (!element) {
        return false;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    return scrollHeight - scrollTop - clientHeight <= threshold;
}

/**
 * 自动滚动到底部（只有在用户已经在底部时才滚动）
 * @param {Object} options - 滚动选项
 * @param {number} options.threshold - 距离底部的阈值
 * @returns {boolean} 滚动是否成功
 */
export function autoScrollToBottom(options = {}) {
    const { threshold = 50, ...scrollOptions } = options;

    if (isScrolledToBottom(scrollOptions.selector, threshold)) {
        return scrollChatListToBottom(scrollOptions);
    }
    return false;
}

/**
 * 滚动工具Hook函数
 * @param {string} selector - 元素选择器
 * @returns {Object} 滚动工具方法集合
 */
export function useScrollToBottom(selector = '.fapiaoAiChatList') {
    if (!selector) {
        return {};
    }

    const scrollToBottom = (smooth = true) => {
        setTimeout(() => {
            scrollChatListToBottom({ smooth, selector });
        }, 100);
    };

    const scrollToLastMsg = (smooth = true) => {
        return scrollToLastMessage({ smooth, chatListSelector: selector });
    };

    const isAtBottom = (threshold = 5) => {
        return isScrolledToBottom(selector, threshold);
    };

    const autoScroll = (threshold = 50, smooth = true) => {
        return autoScrollToBottom({ threshold, smooth, selector });
    };

    return {
        scrollToBottom,
        scrollToLastMsg,
        isAtBottom,
        autoScroll
    };
}