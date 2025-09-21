/* eslint-disable max-len */
import { createSlice } from '@reduxjs/toolkit';
// import { loadChatData } from '../utils/storage';

// 从localStorage恢复聊天数据
const getInitialChatList = () => {
    try {
        const savedChatList = ''; // loadChatData();
        if (savedChatList && savedChatList.length > 0) {
            return savedChatList;
        }
        return [];
    } catch (error) {
        return [];
    }
};

const fapiaoAiChatSlice = createSlice({
    name: 'fapiaoAiChat',
    initialState: {
        chatList: getInitialChatList(),
        chatList1: [{
            index: 0,
            from: 'user',
            message: '我要报销',
            fileList: [{
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
        }, {
            index: 1,
            from: 'system',
            message: `
                <span class="paragraph_1">根据您的要求，我们正在考虑规划按照下列步骤进行处理，形成合规的费用报销单，帮助您提升报销效率：<br /><br />步骤1：发票结构化数据提取<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）OCR&nbsp;纸质发票<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）解析电子发票<br />步骤2：发票校验<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）连接税局查验发票数据<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）校验与您提供的发票结构化数据是否一致&nbsp;<br />步骤3：发票合规检查<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）发票类型是否符合公司报销要求（如增值税专用发票、增值税普通发票、电子.&nbsp;&nbsp;&nbsp;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;发票等）。<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）发票抬头是否为公司名称，避免因抬头错误而报销失败。<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）税号是否正确无误<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4）开票日期是否在可报销的时间范围内<br />步骤4：匹配业务需求<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）是否涉及特定项目、部门预算，需不需要领导审批。<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）是否属于大额发票，是否需要匹配合同、付款申请或采购单。<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）是否涉及进项税额抵扣<br />步骤5：确定报销单类型<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）是否与你自己的历史报销匹配。<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）确定报销单类型<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）汇总填写报销单</span
            `
        }]
    },
    reducers: {
        setProcessing(state, action) {
            state.processing = action.payload;
        },
        setChatList(state, action) {
            state.chatList = action.payload.chatList;
        },
        addChatMessage(state, action) {
            const { message, index, from, fileList = [], ...other } = action.payload;
            state.chatList = state.chatList.concat({
                index,
                from,
                fileList,
                message,
                ...other
            });
        },
        changeChatMessage(state, action) {
            const { index, taskId, message, fileList, ...other } = action.payload;
            if (state.chatList[index]) {
                state.chatList = state.chatList.map((item) => {
                    if (item.taskId && item.taskId === taskId) {
                        return {
                            ...item,
                            message,
                            fileList,
                            ...other
                        };
                    }
                    return item;
                });
            }
        }
    }
});

// 导出 action 和 reducer
export const { setChatList, addChatMessage, changeChatMessage } = fapiaoAiChatSlice.actions;
export default fapiaoAiChatSlice.reducer;
