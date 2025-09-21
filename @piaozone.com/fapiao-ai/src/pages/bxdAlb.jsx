/* eslint-disable max-len, no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../css/bxdAlb.less';
import {
    Button,
    DatePicker,
    Checkbox,
    Input,
    Table,
    Form,
    Card,
    Space,
    Avatar,
    Descriptions,
    message,
    Row,
    Col,
    Typography
} from 'antd';
import {
    SaveOutlined,
    SendOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ExpenseReimbursementForm = (props) => {
    const { config } = props;
    const [form] = Form.useForm();
    const [selectedOptions, setSelectedOptions] = useState([]);

    // 费用明细数据
    const [expenseData, setExpenseData] = useState(props.expenseData);

    // 发票信息数据
    const [invoiceData, setInvoiceData] = useState(props.invoiceData);

    // 收款信息数据
    const [paymentData, setPaymentData] = useState(props.paymentData);

    // 费用明细表格列配置
    const expenseColumns = [
        { title: 'نوع المصروف', dataIndex: 'expenseType', key: 'expenseType' },
        { title: 'تاريخ الحدوث', dataIndex: 'occurDate', key: 'occurDate' },
        { title: 'المبلغ', dataIndex: 'amount', key: 'amount', align: 'left' },
        { title: 'الوصف', dataIndex: 'description', key: 'description' }
    ];

    // 发票信息表格列配置
    const invoiceColumns = [
        { title: 'رقم الفاتورة', dataIndex: 'invoiceNo', key: 'invoiceNo' },
        { title: 'كود الفاتورة', dataIndex: 'invoiceCode', key: 'invoiceCode' },
        { title: 'تاريخ الفاتورة', dataIndex: 'invoiceDate', key: 'invoiceDate' },
        { title: 'مبلغ الفاتورة', dataIndex: 'invoiceAmount', key: 'invoiceAmount', align: 'left' },
        { title: 'مبلغ الضريبة', dataIndex: 'taxAmount', key: 'taxAmount', align: 'left' },
        { title: 'المبلغ الإجمالي', dataIndex: 'totalAmount', key: 'totalAmount', align: 'left' }
    ];

    // 收款信息表格列配置
    const paymentColumns = [
        { title: 'نوع المستفيد', dataIndex: 'payeeType', key: 'payeeType' },
        { title: 'اسم المستفيد', dataIndex: 'payeeName', key: 'payeeName' },
        { title: 'رقم الحساب', dataIndex: 'accountNumber', key: 'accountNumber' },
        { title: 'اسم البنك', dataIndex: 'bankName', key: 'bankName' },
        { title: 'مبلغ الدفع', dataIndex: 'paymentAmount', key: 'paymentAmount', align: 'left' }
    ];

    // 表单提交
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                console.log('保存数据:', values);
                message.success('تم الحفظ بنجاح');
            })
            .catch((errorInfo) => {
                console.log('验证失败:', errorInfo);
            });
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                console.log('提交数据:', values);
                message.success('تم الإرسال بنجاح');
            })
            .catch((errorInfo) => {
                console.log('验证失败:', errorInfo);
            });
    };

    // 添加行操作
    const handleAddExpense = () => {
        const newExpense = {
            key: Date.now().toString(),
            expenseType: '',
            occurDate: '',
            amount: '',
            description: ''
        };
        setExpenseData([...expenseData, newExpense]);
    };

    const handleAddInvoice = () => {
        const newInvoice = {
            key: Date.now().toString(),
            invoiceNo: '',
            invoiceCode: '',
            invoiceDate: '',
            invoiceAmount: '',
            taxAmount: '',
            totalAmount: ''
        };
        setInvoiceData([...invoiceData, newInvoice]);
    };

    const handleAddPayment = () => {
        const newPayment = {
            key: Date.now().toString(),
            payeeType: '',
            payeeName: '',
            accountNumber: '',
            bankName: '',
            paymentAmount: ''
        };
        setPaymentData([...paymentData, newPayment]);
    };

    return (
        <div className='container' dir='rtl'>
            <div className='main-content'>
                {/* 头部操作栏 */}
                <Card className='header-card'>
                    <Row justify='space-between' align='middle'>
                        <Col>
                            <Title level={2} style={{ margin: 0, fontSize: 24 }}>نموذج استرداد المصروفات</Title>
                        </Col>
                        <Col>
                            <Space>
                                <Button type='primary' icon={<SaveOutlined />} onClick={handleSave}>
                                    حفظ
                                </Button>
                                <Button type='primary' icon={<SendOutlined />} onClick={handleSubmit}>
                                    إرسال
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* 用户信息区域 */}
                <Card className='user-info-card' style={{ marginTop: 16 }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Space>
                                <Avatar size={64} src={config.userInfo.avatar} />
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>{config.userInfo.name}</Title>
                                    <Text type='secondary'>الهاتف: {config.userInfo.phone}</Text>
                                    <br />
                                    <Text type='secondary'>نقاط VIP: {config.userInfo.vip}</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col span={16}>
                            <Descriptions column={2}>
                                <Descriptions.Item label='الشركة'>{config.userInfo.company}</Descriptions.Item>
                                <Descriptions.Item label='رقم المستند'>{config.userInfo.documentNumber}</Descriptions.Item>
                                <Descriptions.Item label='القسم'>{config.userInfo.department}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Card>

                {/* 表单区域 */}
                <Card title='المعلومات الأساسية' style={{ marginTop: 16, direction: 'rtl' }}>
                    <Form
                        form={form}
                        layout='vertical'
                        style={{ direction: 'rtl', textAlign: 'right' }}
                        initialValues={{
                            expenseDepartment: config.userInfo.department,
                            expenseCompany: config.userInfo.company,
                            paymentCompany: config.userInfo.company
                        }}
                    >
                        <Row gutter={16} style={{ direction: 'rtl' }}>
                            <Col span={8}>
                                <Form.Item
                                    label='تاريخ الطلب'
                                    name='applicationDate'
                                    rules={[{ required: true, message: 'يرجى اختيار تاريخ الطلب' }]}
                                    style={{ textAlign: 'right', direction: 'rtl' }}
                                    labelCol={{ style: { textAlign: 'right' } }}
                                >
                                    <DatePicker
                                        style={{ width: '100%', direction: 'rtl' }}
                                        defaultValue={moment()}
                                        placement='bottomRight'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='قسم المصروفات'
                                    name='expenseDepartment'
                                    rules={[{ required: true, message: 'يرجى اختيار قسم المصروفات' }]}
                                    style={{ textAlign: 'right', direction: 'rtl' }}
                                    labelCol={{ style: { textAlign: 'right' } }}
                                >
                                    <Input
                                        value={config.userInfo.department}
                                        style={{
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            unicodeBidi: 'plaintext'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='شركة المصروفات'
                                    name='expenseCompany'
                                    rules={[{ required: true, message: 'يرجى اختيار شركة المصروفات' }]}
                                    style={{ textAlign: 'right', direction: 'rtl' }}
                                    labelCol={{ style: { textAlign: 'right' } }}
                                >
                                    <Input
                                        value={config.userInfo.company}
                                        style={{
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            unicodeBidi: 'plaintext'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ direction: 'rtl' }}>
                            <Col span={12}>
                                <Form.Item
                                    label='منتج المصروفات'
                                    name='expenseProduct'
                                    rules={[{ required: true, message: 'يرجى اختيار منتج المصروفات' }]}
                                    style={{ textAlign: 'right', direction: 'rtl' }}
                                    labelCol={{ style: { textAlign: 'right' } }}
                                >
                                    <Input
                                        defaultValue={config.userInfo.product}
                                        style={{
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            unicodeBidi: 'plaintext'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label='شركة الدفع'
                                    name='paymentCompany'
                                    rules={[{ required: true, message: 'يرجى اختيار شركة الدفع' }]}
                                    style={{ textAlign: 'right', direction: 'rtl' }}
                                    labelCol={{ style: { textAlign: 'right' } }}
                                >
                                    <Input
                                        value={config.userInfo.company}
                                        style={{
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            unicodeBidi: 'plaintext'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* 选项区域 */}
                        <Form.Item label='الخيارات' name='options' style={{ display: 'none' }}>
                            <Checkbox.Group
                                options={config.checkboxOptions}
                                value={selectedOptions}
                                onChange={setSelectedOptions}
                            />
                        </Form.Item>

                        {/* 事由区域 */}
                        <Form.Item
                            label='السبب'
                            name='reason'
                            rules={[{ required: true, message: 'يرجى إدخال سبب الاسترداد' }]}
                            style={{ textAlign: 'right', direction: 'rtl' }}
                            labelCol={{ style: { textAlign: 'right' } }}
                        >
                            <TextArea
                                placeholder='يرجى إدخال سبب الاسترداد...'
                                rows={3}
                                maxLength={500}
                                showCount
                                style={{
                                    textAlign: 'right',
                                    direction: 'rtl',
                                    unicodeBidi: 'plaintext'
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Card>

                {/* 费用明细 */}
                <Card
                    title='تفاصيل المصروفات'
                    style={{ marginTop: 16 }}
                >
                    <Table
                        columns={expenseColumns}
                        dataSource={expenseData}
                        pagination={false}
                        size='small'
                        scroll={{ x: 800 }}
                    />
                </Card>

                {/* 发票信息 */}
                <Card
                    title='معلومات الفاتورة'
                    style={{ marginTop: 16 }}
                >
                    <Table
                        columns={invoiceColumns}
                        dataSource={invoiceData}
                        pagination={false}
                        size='small'
                        scroll={{ x: 1000 }}
                    />
                </Card>

                {/* 收款信息 */}
                <Card
                    title='معلومات الدفع'
                    style={{ marginTop: 16 }}
                >
                    <Table
                        columns={paymentColumns}
                        dataSource={paymentData}
                        pagination={false}
                        size='small'
                        scroll={{ x: 900 }}
                    />
                </Card>
            </div>
        </div>
    );
};

ExpenseReimbursementForm.propTypes = {
    config: PropTypes.object.isRequired,
    expenseData: PropTypes.array.isRequired,
    invoiceData: PropTypes.array.isRequired,
    paymentData: PropTypes.array.isRequired
};

export default ExpenseReimbursementForm;