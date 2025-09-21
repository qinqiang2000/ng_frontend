/* eslint-disable max-len, no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../css/bxdCn.less';
import {
    Button,
    Select,
    DatePicker,
    Checkbox,
    Input,
    Table,
    Form,
    Card,
    Space,
    Avatar,
    Descriptions,
    Upload,
    message,
    Row,
    Col,
    Typography
} from 'antd';
import {
    PlusOutlined,
    MinusOutlined,
    SaveOutlined,
    SendOutlined,
    DeleteOutlined,
    InboxOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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
        { title: '费用类型', dataIndex: 'expenseType', key: 'expenseType' },
        { title: '发生日期', dataIndex: 'occurDate', key: 'occurDate' },
        { title: '费用金额', dataIndex: 'amount', key: 'amount', align: 'right' },
        { title: '费用说明', dataIndex: 'description', key: 'description' }
        // {
        //     title: '操作',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Button
        //             type='link'
        //             danger
        //             icon={<DeleteOutlined />}
        //             onClick={() => handleDeleteExpense(record.key)}
        //         />
        //     )
        // }
    ];

    // 发票信息表格列配置
    const invoiceColumns = [
        { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo' },
        { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode' },
        { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate' },
        { title: '发票金额', dataIndex: 'invoiceAmount', key: 'invoiceAmount', align: 'right' },
        { title: '税额', dataIndex: 'taxAmount', key: 'taxAmount', align: 'right' },
        { title: '价税合计', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right' }
        // {
        //     title: '操作',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Button
        //             type='link'
        //             danger
        //             icon={<DeleteOutlined />}
        //             onClick={() => handleDeleteInvoice(record.key)}
        //         />
        //     )
        // }
    ];

    // 收款信息表格列配置
    const paymentColumns = [
        { title: '收款方类型', dataIndex: 'payeeType', key: 'payeeType' },
        { title: '收款方名称', dataIndex: 'payeeName', key: 'payeeName' },
        { title: '收款账号', dataIndex: 'accountNumber', key: 'accountNumber' },
        { title: '开户行', dataIndex: 'bankName', key: 'bankName' },
        { title: '收款金额', dataIndex: 'paymentAmount', key: 'paymentAmount', align: 'right' }
        // {
        //     title: '操作',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Button
        //             type='link'
        //             danger
        //             icon={<DeleteOutlined />}
        //             onClick={() => handleDeletePayment(record.key)}
        //         />
        //     )
        // }
    ];

    // 上传配置
    const uploadProps = {
        name: 'file',
        multiple: true,
        action: '/api/upload',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} 文件上传成功`);
            } else if (status === 'error') {
                message.error(`${info.file.name} 文件上传失败`);
            }
        },
        beforeUpload: (file) => {
            const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
            if (!isValidType) {
                message.error('只能上传 JPG、PNG、PDF 格式的文件！');
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('文件大小不能超过 10MB！');
            }
            return isValidType && isLt10M;
        }
    };

    // 表单提交
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                console.log('保存数据:', values);
                message.success('保存成功');
            })
            .catch((errorInfo) => {
                console.log('验证失败:', errorInfo);
            });
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                console.log('提交数据:', values);
                message.success('提交成功');
            })
            .catch((errorInfo) => {
                console.log('验证失败:', errorInfo);
            });
    };

    // 删除操作函数
    const handleDeleteExpense = (key) => {
        setExpenseData(expenseData.filter((item) => item.key !== key));
        message.success('删除费用明细成功');
    };

    const handleDeleteInvoice = (key) => {
        setInvoiceData(invoiceData.filter((item) => item.key !== key));
        message.success('删除发票信息成功');
    };

    const handleDeletePayment = (key) => {
        setPaymentData(paymentData.filter((item) => item.key !== key));
        message.success('删除收款信息成功');
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
                            <Title level={2} style={{ margin: 0, fontSize: 24 }}>费用报销单</Title>
                        </Col>
                        <Col>
                            <Space>
                                <Button type='primary' icon={<SaveOutlined />} onClick={handleSave}>
                                    保存
                                </Button>
                                <Button type='primary' icon={<SendOutlined />} onClick={handleSubmit}>
                                    提交
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
                                    <Text type='secondary'>电话: {config.userInfo.phone}</Text>
                                    <br />
                                    <Text type='secondary'>VIP积分: {config.userInfo.vip}</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col span={16}>
                            <Descriptions column={2}>
                                <Descriptions.Item label='所属公司'>{config.userInfo.company}</Descriptions.Item>
                                <Descriptions.Item label='单据编号'>{config.userInfo.documentNumber}</Descriptions.Item>
                                <Descriptions.Item label='所属部门'>{config.userInfo.department}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Card>

                {/* 表单区域 */}
                <Card title='基本信息' style={{ marginTop: 16 }}>
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
                                    label='申请日期'
                                    name='applicationDate'
                                    rules={[{ required: true, message: '请选择申请日期' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} defaultValue={moment()} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='费用承担部门'
                                    name='expenseDepartment'
                                    rules={[{ required: true, message: '请选择费用承担部门' }]}
                                >
                                    <Input value={config.userInfo.department} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='费用承担公司'
                                    name='expenseCompany'
                                    rules={[{ required: true, message: '请选择费用承担公司' }]}
                                >
                                    <Input value={config.userInfo.company} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label='费用承担产品'
                                    name='expenseProduct'
                                    rules={[{ required: true, message: '请选择费用承担产品' }]}
                                >
                                    <Input defaultValue={config.userInfo.product} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label='支付公司'
                                    name='paymentCompany'
                                    rules={[{ required: true, message: '请选择支付公司' }]}
                                >
                                    <Input value={config.userInfo.company} />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* 选项区域 */}
                        <Form.Item label='选项' name='options' style={{ display: 'none' }}>
                            <Checkbox.Group
                                options={config.checkboxOptions}
                                value={selectedOptions}
                                onChange={setSelectedOptions}
                            />
                        </Form.Item>

                        {/* 事由区域 */}
                        <Form.Item
                            label='事由'
                            name='reason'
                            rules={[{ required: true, message: '请输入报销事由' }]}
                        >
                            <TextArea
                                placeholder='请输入报销事由...'
                                rows={3}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Card>

                {/* 费用明细 */}
                <Card
                    title='费用明细'
                    extra={
                        <Space style={{ display: 'none' }}>
                            <Button type='primary' size='small' icon={<PlusOutlined />} onClick={handleAddExpense}>
                                增行
                            </Button>
                            <Button size='small' icon={<MinusOutlined />}>
                                删行
                            </Button>
                        </Space>
                    }
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
                    title='发票信息'
                    extra={
                        <Space style={{ display: 'none' }}>
                            <Button type='primary' size='small' icon={<PlusOutlined />} onClick={handleAddInvoice}>
                                增行
                            </Button>
                            <Button size='small' icon={<MinusOutlined />}>
                                删行
                            </Button>
                        </Space>
                    }
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
                    title='收款信息'
                    extra={
                        <Space style={{ display: 'none' }}>
                            <Button type='primary' size='small' icon={<PlusOutlined />} onClick={handleAddPayment}>
                                增行
                            </Button>
                            <Button size='small' icon={<MinusOutlined />}>
                                删行
                            </Button>
                        </Space>
                    }
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

                {/* 附件上传 */}
                <Card title='附件上传' style={{ marginTop: 16, display: 'none' }}>
                    <Dragger {...uploadProps}>
                        <p className='ant-upload-drag-icon'>
                            <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        </p>
                        <p className='ant-upload-text'>支持拖拽文件或截图粘贴上传</p>
                        <p className='ant-upload-hint'>
                            支持格式：JPG、PNG、PDF，单个文件不超过 10M
                        </p>
                    </Dragger>
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