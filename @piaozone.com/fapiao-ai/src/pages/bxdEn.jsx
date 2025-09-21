/* eslint-disable max-len, no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../css/bxdEn.less';
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
        { title: 'Expense Type', dataIndex: 'expenseType', key: 'expenseType' },
        { title: 'Occurrence Date', dataIndex: 'occurDate', key: 'occurDate' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
        { title: 'Description', dataIndex: 'description', key: 'description' }
    ];

    // 发票信息表格列配置
    const invoiceColumns = [
        { title: 'Invoice Number', dataIndex: 'invoiceNo', key: 'invoiceNo' },
        { title: 'Invoice Code', dataIndex: 'invoiceCode', key: 'invoiceCode' },
        { title: 'Invoice Date', dataIndex: 'invoiceDate', key: 'invoiceDate' },
        { title: 'Invoice Amount', dataIndex: 'invoiceAmount', key: 'invoiceAmount', align: 'right' },
        { title: 'Tax Amount', dataIndex: 'taxAmount', key: 'taxAmount', align: 'right' },
        { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right' }
    ];

    // 收款信息表格列配置
    const paymentColumns = [
        { title: 'Payee Type', dataIndex: 'payeeType', key: 'payeeType' },
        { title: 'Payee Name', dataIndex: 'payeeName', key: 'payeeName' },
        { title: 'Account Number', dataIndex: 'accountNumber', key: 'accountNumber' },
        { title: 'Bank Name', dataIndex: 'bankName', key: 'bankName' },
        { title: 'Payment Amount', dataIndex: 'paymentAmount', key: 'paymentAmount', align: 'right' }
    ];

    // 表单提交
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                console.log('保存数据:', values);
                message.success('Save successful');
            })
            .catch((errorInfo) => {
                console.log('验证失败:', errorInfo);
            });
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                console.log('提交数据:', values);
                message.success('Submit successful');
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
        <div className='container'>
            <div className='main-content'>
                {/* 头部操作栏 */}
                <Card className='header-card'>
                    <Row justify='space-between' align='middle'>
                        <Col>
                            <Title level={2} style={{ margin: 0, fontSize: 24 }}>Expense Reimbursement Form</Title>
                        </Col>
                        <Col>
                            <Space>
                                <Button type='primary' icon={<SaveOutlined />} onClick={handleSave}>
                                    Save
                                </Button>
                                <Button type='primary' icon={<SendOutlined />} onClick={handleSubmit}>
                                    Submit
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
                                    <Text type='secondary'>Phone: {config.userInfo.phone}</Text>
                                    <br />
                                    <Text type='secondary'>VIP Points: {config.userInfo.vip}</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col span={16}>
                            <Descriptions column={2}>
                                <Descriptions.Item label='Company'>{config.userInfo.company}</Descriptions.Item>
                                <Descriptions.Item label='Document No.'>{config.userInfo.documentNumber}</Descriptions.Item>
                                <Descriptions.Item label='Department'>{config.userInfo.department}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Card>

                {/* 表单区域 */}
                <Card title='Basic Information' style={{ marginTop: 16 }}>
                    <Form
                        form={form}
                        layout='vertical'
                        initialValues={{
                            expenseDepartment: config.userInfo.department,
                            expenseCompany: config.userInfo.company,
                            paymentCompany: config.userInfo.company
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label='Application Date'
                                    name='applicationDate'
                                    rules={[{ required: true, message: 'Please select application date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} defaultValue={moment()} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='Expense Department'
                                    name='expenseDepartment'
                                    rules={[{ required: true, message: 'Please select expense department' }]}
                                >
                                    <Input value={config.userInfo.department} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='Expense Company'
                                    name='expenseCompany'
                                    rules={[{ required: true, message: 'Please select expense company' }]}
                                >
                                    <Input value={config.userInfo.company} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label='Expense Product'
                                    name='expenseProduct'
                                    rules={[{ required: true, message: 'Please select expense product' }]}
                                >
                                    <Input defaultValue={config.userInfo.product} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label='Payment Company'
                                    name='paymentCompany'
                                    rules={[{ required: true, message: 'Please select payment company' }]}
                                >
                                    <Input value={config.userInfo.company} />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* 选项区域 */}
                        <Form.Item label='Options' name='options' style={{ display: 'none' }}>
                            <Checkbox.Group
                                options={config.checkboxOptions}
                                value={selectedOptions}
                                onChange={setSelectedOptions}
                            />
                        </Form.Item>

                        {/* 事由区域 */}
                        <Form.Item
                            label='Reason'
                            name='reason'
                            rules={[{ required: true, message: 'Please enter reimbursement reason' }]}
                        >
                            <TextArea
                                placeholder='Please enter reimbursement reason...'
                                rows={3}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Card>

                {/* 费用明细 */}
                <Card
                    title='Expense Details'
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
                    title='Invoice Information'
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
                    title='Payment Information'
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