/* eslint-disable max-len */
import { configureStore } from '@reduxjs/toolkit';
import fapiaoAiInputReducer from './fapiaoAiInput';
import fapiaoAiChatReducer from './fapiaoAiChat';
import fapiaoAiTemplateReducer from './fapiaoAiTemplate';
import { persistenceMiddleware } from './persistenceMiddleware';

// 创建store
const store = configureStore({
    reducer: {
        fapiaoAiInput: fapiaoAiInputReducer,
        fapiaoAiChat: fapiaoAiChatReducer,
        fapiaoAiTemplate: fapiaoAiTemplateReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // 忽略这些action类型的序列化检查
                ignoredActions: ['fapiaoAiInput/setFileList'],
                // 忽略这些路径的序列化检查
                ignoredPaths: ['fapiaoAiInput.fileList']
            }
        }).concat(persistenceMiddleware) // 添加持久化中间件
});

export default store;