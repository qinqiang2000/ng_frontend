import { createSlice } from '@reduxjs/toolkit';

const fapiaoAiInputSlice = createSlice({
    name: 'fapiaoAiInput',
    initialState: {
        processing: false,
        processingDescription: '正在处理中',
        proccess: 0,
        processType: '',
        processResult: {},
        taskId: '',
        fileList: [],
        fileList1: [{
            name: 'dzfp_25952000000106635586_亿企上云（天津）科技有限公司_20250529135338.pdf',
            size: 2.5
        }, {
            name: '我的报销单_展示信息列表.png',
            size: 1.2
        }, {
            name: 'dzp_xdp_9144060661746717X8.ofd',
            size: 1.6
        }, {
            name: 'emmet_snippets.xml',
            size: 1.8
        }]
    },
    reducers: {
        setFileList(state, action) {
            state.fileList = action.payload;
        },
        deleteFile(state, action) {
            const index = action.payload;
            if (index >= 0 && index < state.fileList.length) {
                state.fileList = state.fileList.filter((_, i) => i !== index);
            }
        },
        setProcessing(state, action) {
            state.processing = action.payload;
        },
        updateProccess(state, action) {
            state.processing = action.payload.processing;
            state.proccess = action.payload.proccess;
            state.processResult = action.payload.processResult;
            state.processingDescription = action.payload.processingDescription;
        }
    }
});

// 导出 action 和 reducer
export const { setFileList, deleteFile, setProcessing, setTaskId, cancelTask, updateProccess } = fapiaoAiInputSlice.actions;
export default fapiaoAiInputSlice.reducer;
