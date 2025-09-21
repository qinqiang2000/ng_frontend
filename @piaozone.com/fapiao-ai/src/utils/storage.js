/**
 * localStorage持久化工具函数
 */

// 存储key常量
export const STORAGE_KEYS = {
    FAPIAO_AI_CHAT: 'fapiaoAi_chat_data',
    FAPIAO_AI_TEMPLATE: 'fapiaoAi_template_data',
    FAPIAO_AI_ALL: 'fapiaoAi_all_data'
};

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键
 * @param {any} data - 要保存的数据
 * @returns {boolean} 保存是否成功
 */
export function saveToStorage(key, data) {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        return true;
    } catch (error) {
        console.error('保存数据到localStorage失败:', error);
        // 处理可能的配额超出错误
        if (error.name === 'QuotaExceededError') {
            console.warn('localStorage配额已满，尝试清理旧数据...');
            clearOldData();
        }
        return false;
    }
}

/**
 * 从localStorage读取数据
 * @param {string} key - 存储键
 * @param {any} defaultValue - 默认值
 * @returns {any} 读取的数据或默认值
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return defaultValue;
        }
        const data = JSON.parse(serializedData);
        return data;
    } catch (error) {
        console.error('从localStorage读取数据失败:', error);
        return defaultValue;
    }
}

/**
 * 删除localStorage中的数据
 * @param {string} key - 存储键
 * @returns {boolean} 删除是否成功
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('从localStorage删除数据失败:', error);
        return false;
    }
}

/**
 * 保存整个store状态
 * @param {Object} state - Redux store状态
 * @returns {boolean} 保存是否成功
 */
export function saveStoreState(state) {
    const stateToSave = {
        fapiaoAiChat: {
            chatList: state.fapiaoAiChat?.chatList || []
        },
        fapiaoAiTemplate: {
            templateUrl: state.fapiaoAiTemplate?.templateUrl || ''
        },
        timestamp: Date.now() // 添加时间戳
    };

    return saveToStorage(STORAGE_KEYS.FAPIAO_AI_ALL, stateToSave);
}

/**
 * 读取整个store状态
 * @returns {Object|null} 保存的状态或null
 */
export function loadStoreState() {
    const defaultState = {
        fapiaoAiChat: {
            chatList: []
        },
        fapiaoAiTemplate: {
            templateUrl: ''
        }
    };

    const savedState = loadFromStorage(STORAGE_KEYS.FAPIAO_AI_ALL, defaultState);

    // 检查数据有效性
    if (savedState && savedState.timestamp) {
        const savedTime = savedState.timestamp;
        const currentTime = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000; // 24小时

        // 如果数据超过7天，清理数据
        if (currentTime - savedTime > 7 * dayInMs) {
            clearAllData();
            return defaultState;
        }
    }

    return savedState;
}

/**
 * 保存聊天数据
 * @param {Array} chatList - 聊天记录数组
 * @returns {boolean} 保存是否成功
 */
export function saveChatData(chatList) {
    const chatData = {
        chatList: chatList || [],
        timestamp: Date.now()
    };
    return saveToStorage(STORAGE_KEYS.FAPIAO_AI_CHAT, chatData);
}

/**
 * 读取聊天数据
 * @returns {Array} 聊天记录数组
 */
export function loadChatData() {
    const defaultData = [];
    try {
        const savedData = loadFromStorage(STORAGE_KEYS.FAPIAO_AI_CHAT, { chatList: defaultData });
        return savedData.chatList || defaultData;
    } catch (error) {
        return defaultData;
    }
}

/**
 * 保存模板数据
 * @param {string} templateUrl - 模板URL
 * @returns {boolean} 保存是否成功
 */
export function saveTemplateData(templateUrl) {
    const templateData = {
        templateUrl: templateUrl || '',
        timestamp: Date.now()
    };
    return saveToStorage(STORAGE_KEYS.FAPIAO_AI_TEMPLATE, templateData);
}

/**
 * 读取模板数据
 * @returns {string} 模板URL
 */
export function loadTemplateData() {
    const defaultData = '';
    try {
        const savedData = loadFromStorage(STORAGE_KEYS.FAPIAO_AI_TEMPLATE, { templateUrl: defaultData });
        return savedData.templateUrl || defaultData;
    } catch (error) {
        return defaultData;
    }
}

/**
 * 清理所有发票AI相关数据
 * @returns {boolean} 清理是否成功
 */
export function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach((key) => {
            removeFromStorage(key);
        });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 清理旧数据（配额不足时使用）
 * @returns {boolean} 清理是否成功
 */
export function clearOldData() {
    try {
        // 清理过期的聊天记录（保留最近50条）
        const chatData = loadChatData();
        if (chatData.length > 50) {
            const recentChats = chatData.slice(-50);
            saveChatData(recentChats);
        }

        return true;
    } catch (error) {
        console.error('清理旧数据失败:', error);
        return false;
    }
}

/**
 * 获取存储使用情况
 * @returns {Object} 存储使用信息
 */
export function getStorageInfo() {
    try {
        let totalSize = 0;
        const storageInfo = {};

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            const size = data ? new Blob([data]).size : 0;
            storageInfo[name] = {
                size: size,
                sizeKB: (size / 1024).toFixed(2),
                exists: !!data
            };
            totalSize += size;
        });

        return {
            details: storageInfo,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    } catch (error) {
        console.error('获取存储信息失败:', error);
        return null;
    }
}