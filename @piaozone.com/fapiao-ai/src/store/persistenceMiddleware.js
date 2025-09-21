/* eslint-disable indent */

/**
 * Redux持久化中间件
 * 自动保存fapiaoAiChat和fapiaoAiTemplate的状态变化到localStorage
 */

import { saveStoreState, saveChatData, saveTemplateData } from '../utils/storage';

// 需要触发持久化的action类型
const PERSISTENCE_ACTIONS = [
    'fapiaoAiChat/setChatList',
    'fapiaoAiChat/addChatMessage',
    'fapiaoAiChat/changeChatMessage',
    'fapiaoAiTemplate/setTemplateUrl'
];

// 防抖延迟时间（毫秒）
const DEBOUNCE_DELAY = 500;

// 防抖计时器
let debounceTimer = null;

/**
 * 防抖保存函数
 * @param {Function} saveFunction - 保存函数
 * @param {number} delay - 延迟时间
 * @returns {void} 无返回值
 */
function debouncedSave(saveFunction, delay = DEBOUNCE_DELAY) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        saveFunction();
        debounceTimer = null;
    }, delay);
}

/**
 * 持久化中间件
 * @param {Object} store - Redux store
 * @returns {Function} 中间件函数
 */
export const persistenceMiddleware = (store) => (next) => (action) => {
    // 先执行action
    const result = next(action);

    // 检查是否需要持久化
    if (PERSISTENCE_ACTIONS.includes(action.type)) {
        const state = store.getState();

        // 使用防抖来避免频繁保存
        debouncedSave(() => {
            try {
                // 根据action类型选择性保存
                switch (action.type) {
                    case 'fapiaoAiChat/setChatList':
                    case 'fapiaoAiChat/addChatMessage':
                    case 'fapiaoAiChat/changeChatMessage':
                        saveChatData(state.fapiaoAiChat?.chatList || []);
                        break;

                    case 'fapiaoAiTemplate/setTemplateUrl':
                        saveTemplateData(state.fapiaoAiTemplate?.templateUrl || '');
                        break;

                    default:
                        // 保存完整状态作为备份
                        saveStoreState(state);
                        break;
                }
            } catch (error) {
                console.error('自动保存失败:', error);
            }
        });
    }

    return result;
};

/**
 * 手动触发完整状态保存
 * @param {Object} store - Redux store
 * @returns {boolean} 保存是否成功
 */
export function manualSave(store) {
    try {
        const state = store.getState();
        const success = saveStoreState(state);
        if (success) {
            console.log('手动保存成功');
        }
        return success;
    } catch (error) {
        console.error('手动保存失败:', error);
        return false;
    }
}

/**
 * 立即保存（跳过防抖）
 * @param {Object} store - Redux store
 * @returns {boolean} 保存是否成功
 */
export function immediateSave(store) {
    // 清除防抖计时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }

    return manualSave(store);
}