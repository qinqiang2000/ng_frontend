// 费用报销单页面交互脚本

class ExpenseReportForm {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initDatePicker();
        this.initFileUpload();
    }

    // 绑定事件
    bindEvents() {
        // 头部按钮事件
        this.bindHeaderButtons();
        
        // 表格操作事件
        this.bindTableActions();
        
        // 表单验证事件
        this.bindFormValidation();
        
        // 复选框事件
        this.bindCheckboxEvents();
    }

    // 头部按钮事件
    bindHeaderButtons() {
        const buttons = document.querySelectorAll('.header .btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                
                switch(buttonText) {
                    case '保存':
                        this.saveForm();
                        break;
                    case '提交':
                        this.submitForm();
                        break;
                    case '导入发票':
                        this.importInvoice();
                        break;
                    case '查验':
                        this.verifyInvoice();
                        break;
                    case '附件模版下载':
                        this.downloadTemplate();
                        break;
                    case '业务查询':
                        this.businessQuery();
                        break;
                    case '退出':
                        this.exitForm();
                        break;
                }
            });
        });
    }

    // 表格操作事件
    bindTableActions() {
        // 费用明细表格
        this.bindExpenseTableActions();
        
        // 发票信息表格
        this.bindInvoiceTableActions();
        
        // 收款信息表格
        this.bindPaymentTableActions();
    }

    // 费用明细表格操作
    bindExpenseTableActions() {
        const expenseSection = document.querySelector('.expense-section');
        const addBtn = expenseSection.querySelector('.btn-primary');
        const deleteBtn = expenseSection.querySelector('.btn-secondary');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addExpenseRow());
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedExpenseRows());
        }
        
        // 删除按钮事件
        this.bindDeleteIcons('.expense-table');
    }

    // 发票信息表格操作
    bindInvoiceTableActions() {
        const invoiceSection = document.querySelector('.invoice-section');
        const addBtn = invoiceSection.querySelector('.btn-primary');
        const deleteBtn = invoiceSection.querySelector('.btn-secondary');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addInvoiceRow());
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedInvoiceRows());
        }
        
        // 删除按钮事件
        this.bindDeleteIcons('.invoice-table');
    }

    // 收款信息表格操作
    bindPaymentTableActions() {
        const paymentSection = document.querySelector('.payment-section');
        const addBtn = paymentSection.querySelector('.btn-primary');
        const deleteBtn = paymentSection.querySelector('.btn-secondary');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addPaymentRow());
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedPaymentRows());
        }
        
        // 删除按钮事件
        this.bindDeleteIcons('.payment-table');
    }

    // 绑定删除图标事件
    bindDeleteIcons(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (table) {
            table.addEventListener('click', (e) => {
                if (e.target.closest('.delete-icon')) {
                    const row = e.target.closest('tr');
                    this.deleteTableRow(row);
                }
            });
        }
    }

    // 表单验证事件
    bindFormValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    // 复选框事件
    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e.target);
            });
        });
    }

    // 初始化日期选择器
    initDatePicker() {
        const dateInputs = document.querySelectorAll('.date-input');
        
        dateInputs.forEach(input => {
            input.addEventListener('click', () => {
                // 这里可以集成第三方日期选择器
                // 暂时使用原生 date input
                input.type = 'date';
            });
        });
    }

    // 初始化文件上传
    initFileUpload() {
        const uploadArea = document.querySelector('.upload-area');
        
        if (uploadArea) {
            // 拖拽上传
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                this.handleFileUpload(files);
            });
            
            // 点击上传
            uploadArea.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.jpg,.jpeg,.png,.pdf';
                
                input.addEventListener('change', (e) => {
                    this.handleFileUpload(e.target.files);
                });
                
                input.click();
            });
            
            // 粘贴上传
            document.addEventListener('paste', (e) => {
                const items = e.clipboardData.items;
                
                for (let item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        this.handleFileUpload([file]);
                        break;
                    }
                }
            });
        }
    }

    // 保存表单
    saveForm() {
        const formData = this.getFormData();
        
        // 这里可以发送到服务器保存
        console.log('保存表单数据:', formData);
        
        this.showMessage('表单已保存', 'success');
    }

    // 提交表单
    submitForm() {
        if (this.validateForm()) {
            const formData = this.getFormData();
            
            // 这里可以发送到服务器提交
            console.log('提交表单数据:', formData);
            
            this.showMessage('表单已提交', 'success');
        } else {
            this.showMessage('请检查表单填写是否完整', 'error');
        }
    }

    // 导入发票
    importInvoice() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // 这里可以调用 OCR 识别发票信息
                console.log('导入发票文件:', file.name);
                this.showMessage('发票导入成功', 'success');
            }
        });
        
        input.click();
    }

    // 查验发票
    verifyInvoice() {
        const invoiceNumbers = this.getInvoiceNumbers();
        
        if (invoiceNumbers.length === 0) {
            this.showMessage('请先添加发票信息', 'warning');
            return;
        }
        
        // 这里可以调用发票查验接口
        console.log('查验发票:', invoiceNumbers);
        this.showMessage('发票查验完成', 'success');
    }

    // 下载模板
    downloadTemplate() {
        // 这里可以下载附件模板
        console.log('下载附件模板');
        this.showMessage('模板下载中...', 'info');
    }

    // 业务查询
    businessQuery() {
        // 这里可以打开业务查询页面
        console.log('打开业务查询');
    }

    // 退出表单
    exitForm() {
        if (confirm('确定要退出吗？未保存的数据将丢失。')) {
            // 这里可以跳转到其他页面
            console.log('退出表单');
        }
    }

    // 添加费用明细行
    addExpenseRow() {
        const tbody = document.querySelector('.expense-table tbody');
        const newRow = this.createExpenseRow();
        tbody.appendChild(newRow);
        
        this.showMessage('已添加新的费用明细行', 'success');
    }

    // 创建费用明细行
    createExpenseRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" placeholder="请选择费用类型" class="table-input"></td>
            <td><input type="date" class="table-input"></td>
            <td><input type="number" step="0.01" placeholder="0.00" class="table-input amount"></td>
            <td><input type="text" placeholder="请输入费用说明" class="table-input"></td>
            <td>
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" class="delete-icon">
                    <path d="M4.21875 15.4375L4 15L4.21875 15.4375L4 15L1 15Q0.5625 15 0.28125 14.7188Q0 14.4375 0 14Q0 13.5625 0.28125 13.2812Q0.5625 13 1 13L13 13Q13.4375 13 13.7188 13.2812Q14 13.5625 14 14Q14 14.4375 13.7188 14.7188Q13.4375 15 13 15L10 15L9.78125 15.4375Q9.5 15.9688 8.875 16L5.125 16Q4.5 15.9688 4.21875 15.4375ZM13 12L1 12L13 12L1 12L1.65625 1.40625Q1.71875 0.8125 2.125 0.40625Q2.5625 0 3.15625 0L10.8438 0Q11.4375 0 11.875 0.40625Q12.2812 0.8125 12.3438 1.40625L13 12Z" fill="#EF4444"/>
                </svg>
            </td>
        `;
        return row;
    }

    // 添加发票信息行
    addInvoiceRow() {
        const tbody = document.querySelector('.invoice-table tbody');
        const newRow = this.createInvoiceRow();
        tbody.appendChild(newRow);
        
        this.showMessage('已添加新的发票信息行', 'success');
    }

    // 创建发票信息行
    createInvoiceRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" placeholder="发票号码" class="table-input"></td>
            <td><input type="text" placeholder="发票代码" class="table-input"></td>
            <td><input type="date" class="table-input"></td>
            <td><input type="number" step="0.01" placeholder="0.00" class="table-input amount"></td>
            <td><input type="number" step="0.01" placeholder="0.00" class="table-input amount"></td>
            <td><input type="number" step="0.01" placeholder="0.00" class="table-input amount"></td>
            <td>
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" class="delete-icon">
                    <path d="M4.21875 15.4375L4 15L4.21875 15.4375L4 15L1 15Q0.5625 15 0.28125 14.7188Q0 14.4375 0 14Q0 13.5625 0.28125 13.2812Q0.5625 13 1 13L13 13Q13.4375 13 13.7188 13.2812Q14 13.5625 14 14Q14 14.4375 13.7188 14.7188Q13.4375 15 13 15L10 15L9.78125 15.4375Q9.5 15.9688 8.875 16L5.125 16Q4.5 15.9688 4.21875 15.4375ZM13 12L1 12L13 12L1 12L1.65625 1.40625Q1.71875 0.8125 2.125 0.40625Q2.5625 0 3.15625 0L10.8438 0Q11.4375 0 11.875 0.40625Q12.2812 0.8125 12.3438 1.40625L13 12Z" fill="#EF4444"/>
                </svg>
            </td>
        `;
        return row;
    }

    // 添加收款信息行
    addPaymentRow() {
        const tbody = document.querySelector('.payment-table tbody');
        const newRow = this.createPaymentRow();
        tbody.appendChild(newRow);
        
        this.showMessage('已添加新的收款信息行', 'success');
    }

    // 创建收款信息行
    createPaymentRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="table-input">
                    <option>员工</option>
                    <option>供应商</option>
                    <option>其他</option>
                </select>
            </td>
            <td><input type="text" placeholder="收款方名称" class="table-input"></td>
            <td><input type="text" placeholder="收款账号" class="table-input"></td>
            <td><input type="text" placeholder="开户行" class="table-input"></td>
            <td><input type="number" step="0.01" placeholder="0.00" class="table-input amount"></td>
            <td>
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" class="delete-icon">
                    <path d="M4.21875 15.4375L4 15L4.21875 15.4375L4 15L1 15Q0.5625 15 0.28125 14.7188Q0 14.4375 0 14Q0 13.5625 0.28125 13.2812Q0.5625 13 1 13L13 13Q13.4375 13 13.7188 13.2812Q14 13.5625 14 14Q14 14.4375 13.7188 14.7188Q13.4375 15 13 15L10 15L9.78125 15.4375Q9.5 15.9688 8.875 16L5.125 16Q4.5 15.9688 4.21875 15.4375ZM13 12L1 12L13 12L1 12L1.65625 1.40625Q1.71875 0.8125 2.125 0.40625Q2.5625 0 3.15625 0L10.8438 0Q11.4375 0 11.875 0.40625Q12.2812 0.8125 12.3438 1.40625L13 12Z" fill="#EF4444"/>
                </svg>
            </td>
        `;
        return row;
    }

    // 删除表格行
    deleteTableRow(row) {
        if (confirm('确定要删除这一行吗？')) {
            row.remove();
            this.showMessage('已删除该行', 'success');
        }
    }

    // 删除选中的费用明细行
    deleteSelectedExpenseRows() {
        // 这里可以实现批量删除逻辑
        this.showMessage('请选择要删除的行', 'warning');
    }

    // 删除选中的发票信息行
    deleteSelectedInvoiceRows() {
        // 这里可以实现批量删除逻辑
        this.showMessage('请选择要删除的行', 'warning');
    }

    // 删除选中的收款信息行
    deleteSelectedPaymentRows() {
        // 这里可以实现批量删除逻辑
        this.showMessage('请选择要删除的行', 'warning');
    }

    // 处理文件上传
    handleFileUpload(files) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        
        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                this.showMessage(`文件 ${file.name} 超过 10MB 限制`, 'error');
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                this.showMessage(`文件 ${file.name} 格式不支持`, 'error');
                return;
            }
            
            // 这里可以上传文件到服务器
            console.log('上传文件:', file.name);
            this.showMessage(`文件 ${file.name} 上传成功`, 'success');
        });
    }

    // 处理复选框变化
    handleCheckboxChange(checkbox) {
        const label = checkbox.closest('.checkbox-label').textContent.trim();
        console.log(`${label} 选项状态:`, checkbox.checked);
        
        // 根据不同选项执行相应逻辑
        switch(label) {
            case '专项费用':
                // 专项费用逻辑
                break;
            case '无票':
                // 无票逻辑
                break;
            case '多币别':
                // 多币别逻辑
                break;
            case '智能发票报销':
                // 智能发票报销逻辑
                break;
        }
    }

    // 验证字段
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.closest('.form-group')?.querySelector('label')?.textContent || '字段';
        
        // 必填字段验证
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${fieldName}不能为空`);
            return false;
        }
        
        // 数字字段验证
        if (field.type === 'number' && value && isNaN(value)) {
            this.showFieldError(field, `${fieldName}必须是数字`);
            return false;
        }
        
        // 邮箱验证
        if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            this.showFieldError(field, `${fieldName}格式不正确`);
            return false;
        }
        
        return true;
    }

    // 显示字段错误
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--color-error)';
        errorDiv.style.fontSize = 'var(--font-size-xs)';
        errorDiv.style.marginTop = '4px';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--color-error)';
    }

    // 清除字段错误
    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }

    // 验证整个表单
    validateForm() {
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // 获取表单数据
    getFormData() {
        const formData = {
            // 基本信息
            applicantDate: document.querySelector('.date-input')?.value || '',
            costDepartment: document.querySelector('.form-section select')?.value || '',
            costCompany: document.querySelectorAll('.form-section select')[1]?.value || '',
            costProduct: document.querySelectorAll('.form-section select')[2]?.value || '',
            paymentCompany: document.querySelectorAll('.form-section select')[3]?.value || '',
            
            // 选项
            options: {
                specialExpense: document.querySelector('.checkbox-label input[type="checkbox"]')?.checked || false,
                noInvoice: document.querySelectorAll('.checkbox-label input[type="checkbox"]')[1]?.checked || false,
                multiCurrency: document.querySelectorAll('.checkbox-label input[type="checkbox"]')[2]?.checked || false,
                smartInvoice: document.querySelectorAll('.checkbox-label input[type="checkbox"]')[3]?.checked || false
            },
            
            // 事由
            reason: document.querySelector('.reason-section textarea')?.value || '',
            
            // 费用明细
            expenses: this.getTableData('.expense-table'),
            
            // 发票信息
            invoices: this.getTableData('.invoice-table'),
            
            // 收款信息
            payments: this.getTableData('.payment-table')
        };
        
        return formData;
    }

    // 获取表格数据
    getTableData(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) return [];
        
        const rows = table.querySelectorAll('tbody tr');
        const data = [];
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = {};
            
            cells.forEach((cell, index) => {
                const input = cell.querySelector('input, select');
                if (input) {
                    rowData[`field_${index}`] = input.value;
                } else {
                    rowData[`field_${index}`] = cell.textContent.trim();
                }
            });
            
            data.push(rowData);
        });
        
        return data;
    }

    // 获取发票号码列表
    getInvoiceNumbers() {
        const invoiceTable = document.querySelector('.invoice-table');
        if (!invoiceTable) return [];
        
        const rows = invoiceTable.querySelectorAll('tbody tr');
        const numbers = [];
        
        rows.forEach(row => {
            const firstCell = row.querySelector('td');
            if (firstCell) {
                const number = firstCell.textContent.trim();
                if (number) {
                    numbers.push(number);
                }
            }
        });
        
        return numbers;
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // 样式
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.padding = '12px 16px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.color = 'white';
        messageDiv.style.fontSize = '14px';
        messageDiv.style.zIndex = '9999';
        messageDiv.style.transition = 'all 0.3s ease';
        
        // 根据类型设置背景色
        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#52c41a';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#ff4d4f';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#faad14';
                break;
            default:
                messageDiv.style.backgroundColor = '#1890ff';
        }
        
        // 添加到页面
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseReportForm();
});

// 添加表格输入框样式
const style = document.createElement('style');
style.textContent = `
    .table-input {
        width: 100%;
        border: none;
        background: transparent;
        padding: 4px;
        font-size: 14px;
        line-height: 20px;
    }
    
    .table-input:focus {
        outline: 1px solid var(--color-primary);
        background-color: var(--color-background-white);
    }
    
    .upload-area.drag-over {
        border-color: var(--color-primary);
        background-color: rgba(24, 144, 255, 0.1);
    }
    
    .field-error {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style); 