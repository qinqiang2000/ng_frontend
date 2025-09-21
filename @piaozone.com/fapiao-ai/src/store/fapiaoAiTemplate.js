import { createSlice } from '@reduxjs/toolkit';
// import { loadTemplateData } from '../utils/storage';

// 从localStorage恢复模板数据
const getInitialTemplateUrl = () => {
    try {
        // getInitialTemplateUrl() // 从localStorage恢复或使用默认值
        const savedTemplateUrl = 'http://172.21.52.67:7001/fapiao-ai/template/bxd-cn?taskId=task_1750225745279_17olzy3qf&formType=费用报销单';
        if (savedTemplateUrl) {
            return savedTemplateUrl;
        }
        return '';
    } catch (error) {
        return '';
    }
};

const fapiaoAiTemplateSlice = createSlice({
    name: 'fapiaoAiTemplate',
    initialState: {
        templateUrl: getInitialTemplateUrl(),
        displayTemplate: false
    },
    reducers: {
        setTemplateUrlAndDisplay(state, action) {
            state.templateUrl = action.payload.templateUrl;
            state.displayTemplate = action.payload.displayTemplate;
        },
        setTemplateUrl(state, action) {
            state.templateUrl = action.payload;
        },
        setDisplay(state, action) {
            state.displayTemplate = action.payload;
        }
    }
});

// 导出 action 和 reducer
export const { setTemplateUrl, setDisplay } = fapiaoAiTemplateSlice.actions;
export default fapiaoAiTemplateSlice.reducer;
