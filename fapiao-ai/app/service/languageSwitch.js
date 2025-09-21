'use strict';

const Service = require('egg').Service;

class LanguageSwitchService extends Service {

    /**
     * 切换报销单页面语言版本
     * @param {String} taskId - 任务ID
     * @param {String} targetLanguage - 目标语言 (cn/en/alb)
     * @param {String} userId - 用户ID
     */
    async switchReimbursementLanguage(taskId, targetLanguage, userId) {
        const { ctx } = this;

        try {
            // 获取任务状态
            const taskStatus = await ctx.service.chat.getTaskStatus(taskId);
            if (!taskStatus) {
                throw new Error('任务不存在');
            }

            if (taskStatus.type !== 'expense_report') {
                throw new Error('只支持费用报销任务的语言切换');
            }

            if (taskStatus.status !== 'completed') {
                throw new Error('任务尚未完成，无法切换语言版本');
            }

            // 验证语言代码
            const supportedLanguages = ['cn', 'en', 'alb'];
            if (!supportedLanguages.includes(targetLanguage)) {
                throw new Error(`不支持的语言版本: ${targetLanguage}`);
            }

            // 获取报销单数据
            const reimbursementData = taskStatus.result?.data?.steps?.reimbursementForm;
            if (!reimbursementData || reimbursementData.status !== 'completed') {
                throw new Error('报销单数据不完整');
            }

            // 生成新的URL
            const newFormUrl = this.generateLanguageUrl(
                taskId,
                reimbursementData.formType,
                targetLanguage
            );

            ctx.logger.info(`语言切换完成: ${taskId} -> ${targetLanguage}`);

            return {
                success: true,
                taskId,
                targetLanguage,
                formUrl: newFormUrl,
                switchedAt: new Date()
            };

        } catch (error) {
            ctx.logger.error(`语言切换失败: ${taskId}`, error);
            return {
                success: false,
                error: error.message,
                taskId,
                targetLanguage
            };
        }
    }

    /**
     * 生成语言版本URL
     * @param {String} taskId - 任务ID
     * @param {String} formType - 表单类型
     * @param {String} language - 语言版本
     */
    generateLanguageUrl(taskId, formType, language) {
        const baseUrl = `/fapiao-ai/template/bxd-${language}`;
        return `${baseUrl}?taskId=${taskId}&formType=${formType}`;
    }

    /**
     * 本地化表单数据
     * @param {Object} formData - 原始表单数据
     * @param {String} language - 目标语言
     */
    localizeFormData(formData, language) {
        const localizedData = { ...formData };

        // 根据语言版本转换字段名和内容
        switch (language) {
            case 'en':
                localizedData.items = formData.items.map(item => ({
                    'No.': item.序号,
                    'Invoice Number': item.发票号码,
                    'Invoice Date': item.发票日期,
                    'Seller': item.销售方,
                    'Expense Type': this.translateExpenseType(item.费用类型, 'en'),
                    'Amount': item.金额,
                    'Remarks': item.备注
                }));
                localizedData.summary.purpose = this.translatePurpose(formData.summary.purpose, 'en');
                break;

            case 'alb':
                localizedData.items = formData.items.map(item => ({
                    'رقم': item.序号,
                    'رقم الفاتورة': item.发票号码,
                    'تاريخ الفاتورة': item.发票日期,
                    'البائع': item.销售方,
                    'نوع المصروف': this.translateExpenseType(item.费用类型, 'alb'),
                    'المبلغ': item.金额,
                    'ملاحظات': item.备注
                }));
                localizedData.summary.purpose = this.translatePurpose(formData.summary.purpose, 'alb');
                break;

            default: // cn
                // 保持原始中文数据
                break;
        }

        return localizedData;
    }

    /**
     * 翻译费用类型
     * @param {String} expenseType - 费用类型
     * @param {String} language - 目标语言
     */
    translateExpenseType(expenseType, language) {
        const translations = {
            en: {
                '交通费': 'Transportation',
                '住宿费': 'Accommodation',
                '餐饮费': 'Meals',
                '办公用品': 'Office Supplies',
                '技术服务费': 'Technical Services',
                '其他费用': 'Other Expenses'
            },
            alb: {
                '交通费': 'النقل',
                '住宿费': 'الإقامة',
                '餐饮费': 'الوجبات',
                '办公用品': 'اللوازم المكتبية',
                '技术服务费': 'الخدمات التقنية',
                '其他费用': 'مصاريف أخرى'
            }
        };

        return translations[language]?.[expenseType] || expenseType;
    }

    /**
     * 翻译报销用途
     * @param {String} purpose - 报销用途
     * @param {String} language - 目标语言
     */
    translatePurpose(purpose, language) {
        const translations = {
            en: {
                '差旅费用报销': 'Business Trip Expense Reimbursement',
                '办公用品采购报销': 'Office Supplies Purchase Reimbursement',
                '服务费用报销': 'Service Fee Reimbursement',
                '一般费用报销': 'General Expense Reimbursement',
                '费用报销': 'Expense Reimbursement'
            },
            alb: {
                '差旅费用报销': 'استرداد مصاريف السفر',
                '办公用品采购报销': 'استرداد مشتريات اللوازم المكتبية',
                '服务费用报销': 'استرداد رسوم الخدمة',
                '一般费用报销': 'استرداد المصاريف العامة',
                '费用报销': 'استرداد المصاريف'
            }
        };

        return translations[language]?.[purpose] || purpose;
    }

    /**
     * 获取语言信息
     * @param {String} language - 语言代码
     */
    getLanguageInfo(language) {
        const languageInfo = {
            cn: {
                code: 'cn',
                name: '中文',
                nativeName: '中文',
                direction: 'ltr'
            },
            en: {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                direction: 'ltr'
            },
            alb: {
                code: 'alb',
                name: 'Arabic',
                nativeName: 'العربية',
                direction: 'rtl'
            }
        };

        return languageInfo[language] || languageInfo.cn;
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return [
            this.getLanguageInfo('cn'),
            this.getLanguageInfo('en'),
            this.getLanguageInfo('alb')
        ];
    }

    /**
     * 分析用户语言切换意图
     * @param {String} message - 用户消息
     */
    analyzeLanguageSwitchIntent(message) {
        const lowerMessage = message.toLowerCase();

        // 中文关键词
        if (lowerMessage.includes('中文') || lowerMessage.includes('中文版') ||
            lowerMessage.includes('切换中文') || lowerMessage.includes('改成中文')) {
            return { language: 'cn', confidence: 0.9 };
        }

        // 英文关键词
        if (lowerMessage.includes('英文') || lowerMessage.includes('english') ||
            lowerMessage.includes('英文版') || lowerMessage.includes('切换英文') ||
            lowerMessage.includes('改成英文')) {
            return { language: 'en', confidence: 0.9 };
        }

        // 阿拉伯语关键词
        if (lowerMessage.includes('阿拉伯') || lowerMessage.includes('arabic') ||
            lowerMessage.includes('阿拉伯语') || lowerMessage.includes('切换阿拉伯') ||
            lowerMessage.includes('改成阿拉伯')) {
            return { language: 'alb', confidence: 0.9 };
        }

        // 通用切换关键词
        if (lowerMessage.includes('切换') || lowerMessage.includes('改成') ||
            lowerMessage.includes('换成') || lowerMessage.includes('switch') ||
            lowerMessage.includes('change')) {
            return { language: null, confidence: 0.5, needsSpecification: true };
        }

        return { language: null, confidence: 0 };
    }
}

module.exports = LanguageSwitchService;