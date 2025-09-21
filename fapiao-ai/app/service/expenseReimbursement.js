'use strict';

const Service = require('egg').Service;

class ExpenseReimbursementService extends Service {

    getBaseConfig() {
        return {
            userInfo: {
                avatar: 'https://image-resource.mastergo.com/158214309880609/160207613324011/8b5ae24268ba785f91b79c6a555e86f5.png',
                name: '陈思远',
                phone: '138****5678',
                vip: '2,580',
                company: '北京科技创新有限公司',
                companyTaxNumber: '91110000987654321X',
                department: '研发中心-基础服务部',
                documentNumber: 'FY2023120500123',
                product: '基础服务'
            },
            formOptions: {
                departments: [
                    { value: '研发中心-产品开发部', label: '研发中心-产品开发部' },
                    { value: '市场部', label: '市场部' },
                    { value: '财务部', label: '财务部' }
                ],
                companies: [
                    { value: '北京科技创新有限公司', label: '北京科技创新有限公司' },
                    { value: '上海分公司', label: '上海分公司' }
                ],
                products: [
                    { value: '企业智能办公系统', label: '企业智能办公系统' },
                    { value: '移动办公平台', label: '移动办公平台' }
                ]
            },
            checkboxOptions: [
                { value: 'special', label: '专项费用' },
                { value: 'noInvoice', label: '无票' },
                { value: 'multiCurrency', label: '多币别' },
                { value: 'smartInvoice', label: '智能发票报销' }
            ],
            paymentData: [
                {
                    key: '1',
                    payeeType: '员工',
                    payeeName: '陈思远',
                    accountNumber: '6222 **** **** 1234',
                    bankName: '中国工商银行北京分行',
                    paymentAmount: '2,077.60'
                }
            ]
        };
    }

    /**
     * 处理费用报销流程
     * @param {Array} fileList - 上传的发票文件列表
     * @param {Object} userInfo - 用户信息
     * @param {String} taskId - 任务ID
     */
    async processExpenseReimbursement(fileList, originUserInfo, taskId) {
        const { ctx } = this;
        const userInfo = {
            ...this.getBaseConfig().userInfo,
            ...originUserInfo
        };
        try {
            ctx.logger.info(`开始处理费用报销流程, 任务ID: ${taskId}, 文件数量: ${fileList.length}`);

            // 更新任务状态
            ctx.service.taskManager.updateTaskStatus(taskId, 'running', 5, null, null);

            const results = {
                taskId,
                totalFiles: fileList.length,
                processedFiles: 0,
                steps: {
                    dataExtraction: { status: 'pending', results: [] },
                    // verification: { status: 'pending', results: [] },
                    complianceCheck: { status: 'pending', results: [] },
                    reimbursementForm: { status: 'pending', results: [] }
                },
                summary: {
                    totalAmount: 0,
                    validInvoices: 0,
                    invalidInvoices: 0,
                    warnings: [],
                    errors: []
                }
            };

            // 步骤1：发票结构化数据提取
            ctx.logger.info('开始步骤1：发票结构化数据提取');
            ctx.service.taskManager.updateTaskStatus(taskId, 'running', 15, null, null);

            const extractionResults = await this.extractInvoiceData(fileList, taskId);

            results.steps.dataExtraction = extractionResults;
            results.processedFiles = extractionResults.results.length;

            // 步骤2：发票合规检查
            ctx.logger.info('开始步骤3：发票合规检查');
            ctx.service.taskManager.updateTaskStatus(taskId, 'running', 60, null, null);

            const complianceResults = await this.checkCompliance(extractionResults.results, userInfo, taskId);
            results.steps.complianceCheck = complianceResults;

            // 步骤3：确定报销单类型并生成报销单
            ctx.logger.info('开始步骤4：确定报销单类型并生成报销单');
            ctx.service.taskManager.updateTaskStatus(taskId, 'running', 95, null, null);

            const reimbursementFormResults = await this.generateReimbursementForm(extractionResults.results, userInfo, taskId);
            results.steps.reimbursementForm = reimbursementFormResults;

            ctx.logger.info(`费用报销流程完成, 任务ID: ${taskId}`);
            return results;

        } catch (error) {
            ctx.logger.error(`费用报销流程失败, 任务ID: ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * 步骤1：发票结构化数据提取
     * @param {Array} fileList - 文件列表
     * @param {String} taskId - 任务ID
     */
    async extractInvoiceData(fileList, taskId) {
        const { ctx } = this;
        const results = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const progress = 15 + (i / fileList.length) * 20; // 15-35%

            ctx.service.taskManager.updateTaskStatus(taskId, 'running', Math.round(progress));

            try {
                // 获取文件名，支持多种字段名
                const filename = file.filename || file.name || file.originalName || `文件${i + 1}`;

                ctx.logger.info(`处理文件: ${filename}`);

                const extractedRes = await ctx.service.piaozone.recognizeInvoice(file);
                if (extractedRes.errcode !== '0000') {
                    throw new Error(extractedRes.description);
                }
                for (let j = 0; j < extractedRes.data.length; j++) {
                    results.push({
                        fileIndex: i,
                        filename: filename,
                        extractionStatus: 'success',
                        extractedAt: new Date(),
                        ...extractedRes.data[j]
                    });
                }
            } catch (error) {
                const filename = file.filename || file.name || file.originalName || `文件${i + 1}`;
                ctx.logger.error(`文件处理失败: ${filename}`, error);
                results.push({
                    fileIndex: i,
                    filename: filename,
                    fileType: 'unknown',
                    extractionStatus: 'failed',
                    error: error.message,
                    extractedAt: new Date()
                });
            }
        }

        return {
            status: 'completed',
            results,
            successCount: results.filter(r => r.extractionStatus === 'success').length,
            failedCount: results.filter(r => r.extractionStatus === 'failed').length
        };
    }

    /**
     * 步骤3：发票合规检查
     * @param {Array} invoiceData - 提取的发票数据
     * @param {Object} userInfo - 用户信息
     * @param {String} taskId - 任务ID
     */
    async checkCompliance(invoiceData, userInfo, taskId) {
        const { ctx } = this;
        const results = [];

        // 获取公司合规配置
        const complianceConfig = this.getComplianceConfig(userInfo);
        const successfulExtractions = invoiceData.filter(item => item.extractionStatus === 'success');

        for (let i = 0; i < successfulExtractions.length; i++) {
            const invoice = successfulExtractions[i];
            const progress = 60 + (i / successfulExtractions.length) * 15; // 60-75%

            ctx.service.taskManager.updateTaskStatus(taskId, 'running', Math.round(progress));

            try {
                ctx.logger.info(`合规检查: ${invoice.filename}`);
                const complianceResult = {
                    fileIndex: invoice.fileIndex,
                    filename: invoice.filename,
                    invoiceType: invoice.invoiceType,
                    invoiceCode: invoice.invoiceCode,
                    invoiceNo: invoice.invoiceNo,
                    buyerName: invoice.buyerName,
                    buyerTaxNo: invoice.buyerTaxNo,
                    invoiceDate: invoice.invoiceDate,
                    totalAmount: invoice.totalAmount,
                    checks: {
                        invoiceType: this.checkInvoiceType(invoice, complianceConfig),
                        invoiceHeader: this.checkInvoiceHeader(invoice, complianceConfig),
                        taxNumber: this.checkTaxNumber(invoice, complianceConfig)
                    },
                    overallCompliant: true,
                    warnings: [],
                    errors: [],
                    checkedAt: new Date()
                };

                // 汇总检查结果
                const allChecks = Object.values(complianceResult.checks);
                complianceResult.overallCompliant = allChecks.every(check => check.passed);

                // 收集警告和错误
                allChecks.forEach(check => {
                    if (check.warnings) {
                        complianceResult.warnings.push(...check.warnings);
                    }
                    if (check.errors) {
                        complianceResult.errors.push(...check.errors);
                    }
                });

                results.push(complianceResult);

            } catch (error) {
                ctx.logger.error(`合规检查失败: ${invoice.filename}`, error);
                results.push({
                    fileIndex: invoice.fileIndex,
                    filename: invoice.filename,
                    checks: {},
                    overallCompliant: false,
                    errors: [error.message],
                    checkedAt: new Date()
                });
            }
        }

        return {
            status: 'completed',
            results,
            compliantCount: results.filter(r => r.overallCompliant).length,
            nonCompliantCount: results.filter(r => !r.overallCompliant).length
        };
    }

    /**
     * 获取公司合规配置
     * @param {Object} userInfo - 用户信息
     */
    getComplianceConfig(userInfo) {
        return {
            allowedInvoiceTypes: [
                '1', //电子普通发票
                '2', //电子专用发票
                '3', //纸质普通发票
                '4', //纸质专用发票
                '5', //普通纸质卷票
                '7', //通用机打纸质发票
                '8', //的士票
                '9', //火车票
                '10', //飞机票
                '11', //其他票
                '12', //机动车销售发票
                '13', //二手车销售发票
                '14', //定额发票
                '15', //通行费电子发票
                '16', //客运发票
                '17', //过路桥费发票
                '19', //完税证明
                '20', //轮船票
                '21', //海关缴款书
                '23', //通用机打电子发票
                '24', //火车票退票凭证
                '25', //财政电子票据
                '26', //数电票（普通发票）
                '27', //数电票（增值税专用发票）
                '28', //数电票（航空运输电子客票行程单）
                '29', //数电票（铁路电子客票）
                '30' //形式发票
            ],
            companyName: userInfo.company,
            companyTaxNumber: userInfo.companyTaxNumber,
            reimbursementDateRange: {
                maxDaysFromInvoiceDate: 90, // 发票日期后90天内可报销
                maxDaysFromSubmission: 30   // 提交后30天内必须完成报销
            }
        };
    }

    /**
     * 检查发票类型
     * @param {Object} invoiceData - 发票数据
     * @param {Object} config - 合规配置
     */
    checkInvoiceType(invoiceData, config) {
        const isAllowed = config.allowedInvoiceTypes.includes(invoiceData.invoiceType);

        return {
            passed: isAllowed,
            checkName: '发票类型检查',
            expected: config.allowedInvoiceTypes,
            actual: invoiceData.invoiceType,
            errors: isAllowed ? [] : [`发票类型"${invoiceData.invoiceType}"不符合公司报销要求`],
            warnings: []
        };
    }

    /**
     * 检查发票抬头
     * @param {Object} invoiceData - 发票数据
     * @param {Object} config - 合规配置
     */
    checkInvoiceHeader(invoiceData, config) {
        const buyerName = invoiceData.buyerName.trim();
        const expectedName = config.companyName.trim();
        const isCorrect = buyerName === expectedName;

        return {
            passed: isCorrect,
            checkName: '发票抬头检查',
            expected: expectedName,
            actual: buyerName,
            errors: isCorrect ? [] : [`发票抬头"${buyerName}"与公司名称"${expectedName}"不一致`],
            warnings: []
        };
    }

    /**
     * 检查税号
     * @param {Object} invoiceData - 发票数据
     * @param {Object} config - 合规配置
     */
    checkTaxNumber(invoiceData, config) {
        const buyerTaxNumber = invoiceData.buyerTaxNo.trim();
        const expectedTaxNumber = config.companyTaxNumber.trim();
        const isCorrect = buyerTaxNumber === expectedTaxNumber;

        return {
            passed: isCorrect,
            checkName: '税号检查',
            expected: expectedTaxNumber,
            actual: buyerTaxNumber,
            errors: isCorrect ? [] : [`税号"${buyerTaxNumber}"与公司税号"${expectedTaxNumber}"不一致`],
            warnings: []
        };
    }

    /**
     * 步骤4：确定报销单类型并生成报销单
     * @param {Array} invoiceData - 提取的发票数据
     * @param {Object} userInfo - 用户信息
     * @param {String} taskId - 任务ID
     */
    async generateReimbursementForm(invoiceData, userInfo, taskId) {
        const { ctx } = this;

        try {
            const successfulExtractions = invoiceData.filter(item => item.extractionStatus === 'success');

            // // 2. 确定报销单类型
            const formType = this.determineReimbursementType(successfulExtractions);

            // 3. 汇总填写报销单
            const formData = this.generateFormData(successfulExtractions, formType, userInfo);

            // 4. 生成报销单页面URL
            const formUrl = this.generateFormUrl(taskId, formType, 'cn'); // 默认中文版

            ctx.logger.info(`报销单生成完成: ${formUrl}`);

            return {
                status: 'completed',
                formType,
                formUrl,
                formData,
                // historyMatch,
                availableLanguages: ['cn', 'en', 'alb'], // 中文、英文、阿拉伯语
                generatedAt: new Date()
            };

        } catch (error) {
            ctx.logger.error('生成报销单失败:', error);
            return {
                status: 'failed',
                error: error.message,
                generatedAt: new Date()
            };
        }
    }

    /**
     * 根据发票明细生成费用报销明细
     * @param {Array} invoiceData - 发票数据数组
     * @returns {Array} 费用明细数组
     */
    getExpenseData(invoiceData) {
        const expenseData = [];

        for (let i = 0; i < invoiceData.length; i++) {
            const invoice = invoiceData[i];

            const invoiceData_item = invoice.items;
            const invoiceType = invoiceData_item.invoiceType;

            // 取第一行发票明细作为费用明细的基础
            const firstItem = invoiceData_item ? invoiceData_item[0] : {};
            const goodsName = firstItem.name || firstItem.goodsName || '';

            // 根据商品名称和发票类型进行费用分类
            const expenseType = this.classifyExpenseType(goodsName, invoiceType);

            // 生成费用明细
            const expenseDetail = {
                expenseType: expenseType, // 费用类型
                occurDate: invoice.invoiceDate, // 发生日期（使用发票日期）
                amount: invoice.totalAmount || 0, // 费用金额
                description: this.generateExpenseDescription(invoice) // 费用说明
            };

            expenseData.push(expenseDetail);
        }

        return expenseData;
    }

        /**
     * 根据商品名称和发票类型分类费用类型
     * @param {String} goodsName - 商品名称
     * @param {Number} invoiceType - 发票类型
     * @returns {String} 费用类型
     */
    classifyExpenseType(goodsName, invoiceType) {
        let expenseType = '其他费用';

        // 首先通过商品名称进行分类
        if (goodsName && goodsName.trim()) {
            const name = goodsName.toLowerCase();

            // 交通费
            if (name.includes('交通') || name.includes('车票') || name.includes('机票') ||
                name.includes('火车票') || name.includes('高铁') || name.includes('出租车') ||
                name.includes('网约车') || name.includes('地铁') || name.includes('公交') ||
                name.includes('船票') || name.includes('轮船') || name.includes('客运') ||
                name.includes('通行费') || name.includes('过路费') || name.includes('桥费')) {
                expenseType = '交通费';
            }

            // 住宿费
            else if (name.includes('住宿') || name.includes('酒店') || name.includes('宾馆') ||
                name.includes('民宿') || name.includes('旅馆') || name.includes('客栈')) {
                expenseType = '住宿费';
            }

            // 餐饮费
            else if (name.includes('餐') || name.includes('饮食') || name.includes('午餐') ||
                name.includes('晚餐') || name.includes('早餐') || name.includes('用餐') ||
                name.includes('食品') || name.includes('饮料') || name.includes('茶水') ||
                name.includes('咖啡') || name.includes('零食')) {
                expenseType = '餐饮费';
            }

            // 办公用品
            else if (name.includes('办公') || name.includes('用品') || name.includes('文具') ||
                name.includes('纸张') || name.includes('笔') || name.includes('本子') ||
                name.includes('打印') || name.includes('复印') || name.includes('耗材')) {
                expenseType = '办公用品费';
            }

            // 技术服务费
            else if (name.includes('技术') || name.includes('服务') || name.includes('咨询') ||
                name.includes('开发') || name.includes('维护') || name.includes('培训') ||
                name.includes('软件') || name.includes('系统') || name.includes('信息')) {
                expenseType = '技术服务费';
            }

            // 通讯费
            else if (name.includes('通讯') || name.includes('电话') || name.includes('网络') ||
                name.includes('宽带') || name.includes('流量') || name.includes('话费') ||
                name.includes('上网') || name.includes('通信')) {
                expenseType = '通讯费';
            }

            // 会议费
            else if (name.includes('会议') || name.includes('培训') || name.includes('研讨') ||
                name.includes('论坛') || name.includes('峰会') || name.includes('讲座') ||
                name.includes('座谈') || name.includes('学习')) {
                expenseType = '会议费';
            }

            // 招待费
            else if (name.includes('招待') || name.includes('接待') || name.includes('娱乐') ||
                name.includes('礼品') || name.includes('礼物') || name.includes('纪念品')) {
                expenseType = '招待费';
            }

            // 设备费
            else if (name.includes('设备') || name.includes('硬件') || name.includes('电脑') ||
                name.includes('手机') || name.includes('平板') || name.includes('器材') ||
                name.includes('机械') || name.includes('工具')) {
                expenseType = '设备费';
            }

            // 燃油费
            else if (name.includes('燃油') || name.includes('汽油') || name.includes('柴油') ||
                name.includes('加油') || name.includes('油费')) {
                expenseType = '燃油费';
            }

            // 维修费
            else if (name.includes('维修') || name.includes('保养') || name.includes('修理') ||
                name.includes('检修') || name.includes('更换')) {
                expenseType = '维修费';
            }
        }

        // 如果通过商品名称无法分类（为空或分类为"其他费用"），则通过发票类型判断
        if (!goodsName || !goodsName.trim() || expenseType === '其他费用') {
            expenseType = this.classifyByInvoiceType(invoiceType);
        }

        return expenseType;
    }

    /**
     * 根据发票类型分类费用类型
     * @param {Number} invoiceType - 发票类型
     * @returns {String} 费用类型
     */
    classifyByInvoiceType(invoiceType) {
        switch (invoiceType) {
            case '8':  // 的士票
            case '9':  // 火车票
            case '10': // 飞机票
            case '15': // 通行费电子发票
            case '16': // 客运发票
            case '17': // 过路桥费发票
            case '20': // 轮船票
            case '24': // 火车票退票凭证
            case '28': // 数电票（航空运输电子客票行程单）
            case '29': // 数电票（铁路电子客票）
                return '交通费';

            case '12': // 机动车销售发票
            case '13': // 二手车销售发票
                return '设备费'; // 车辆可归类为设备费

            case '19': // 完税证明
            case '21': // 海关缴款书
                return '税费';

            case '25': // 财政电子票据
                return '行政费用';

            default:
                // 其他类型的发票（普通发票、专用发票等）无法直接从类型判断费用类型
                return '其他费用';
        }
    }

    /**
     * 生成费用说明
     * @param {Object} invoice - 发票数据
     * @param {Object} firstItem - 第一行发票明细
     * @returns {String} 费用说明
     */
    generateExpenseDescription(invoice, firstItem) {
        const descriptions = [];

        // 使用发票备注作为主要说明
        if (invoice.remark && invoice.remark.trim()) {
            descriptions.push(invoice.remark.trim());
        }

        return descriptions.join('；');
    }

    /**
     * 确定报销单类型
     * @param {Array} invoiceData - 发票数据
     * @param {Object} historyMatch - 历史匹配结果
     */
    determineReimbursementType(invoiceData, historyMatch) {
        return '费用报销单';
    }

    /**
     * 生成表单数据
     * @param {Array} invoiceData - 发票数据
     * @param {String} formType - 表单类型
     * @param {Object} userInfo - 用户信息
     */
    generateFormData(invoiceData, formType, userInfo) {
        // 生成费用明细
        const expenseData = this.getExpenseData(invoiceData);
        const baseConfig = this.getBaseConfig();
        const formData = {
            formType,
            currency: 'CNY',
            invoiceCount: invoiceData.length,
            ...baseConfig,
            userInfo,
            expenseData: expenseData, // 使用生成的费用明细
            invoiceData: invoiceData.map((invoice, index) => {
                // 生成唯一key，处理可能为空的字段
                const invoiceCode = invoice.data?.invoiceCode || '';
                const invoiceNumber = invoice.data?.invoiceNo || '';
                const key = `${invoiceCode}_${invoiceNumber}_${index}`;

                return {
                    key: key,
                    ...invoice
                };
            })
        };
        return formData;
    }

    /**
     * 生成表单URL
     * @param {String} taskId - 任务ID
     * @param {String} formType - 表单类型
     * @param {String} language - 语言版本
     */
    generateFormUrl(taskId, formType, language = 'cn') {
        const baseUrl = '/fapiao-ai/template/bxd';
        return `${baseUrl}-${language}?taskId=${taskId}&formType=${formType}`;
    }
}

module.exports = ExpenseReimbursementService;