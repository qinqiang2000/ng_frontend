import getAiBxdCn from "../src/";

const st = getAiBxdCn();

const formConfig = {
    userInfo: {
        avatar: 'https://image-resource.mastergo.com/158214309880609/160207613324011/8b5ae24268ba785f91b79c6a555e86f5.png',
        name: '陈思远',
        phone: '138****5678',
        vip: '2,580',
        company: '北京科技创新有限公司',
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
    ]
};

// 费用明细数据
const expenseData = [
    {
        key: '1',
        expenseType: '差旅费-住宿',
        occurDate: '2023-12-05',
        amount: '680.00',
        description: '出差上海住宿费用'
    },
    {
        key: '2',
        expenseType: '差旅费-交通',
        occurDate: '2023-12-05',
        amount: '1,280.00',
        description: '北京-上海往返机票'
    }
];

// 发票信息数据
const invoiceData = [
    {
        key: '1',
        invoiceNumber: '12345678',
        invoiceCode: '044001900211',
        invoiceDate: '2023-12-05',
        invoiceAmount: '680.00',
        taxAmount: '40.80',
        totalAmount: '720.80'
    },
    {
        key: '2',
        invoiceNumber: '87654321',
        invoiceCode: '044001900212',
        invoiceDate: '2023-12-05',
        invoiceAmount: '1,280.00',
        taxAmount: '76.80',
        totalAmount: '1,356.80'
    }
];

// 收款信息数据
const paymentData = [
    {
        key: '1',
        payeeType: '员工',
        payeeName: '陈思远',
        accountNumber: '6222 **** **** 1234',
        bankName: '中国工商银行北京分行',
        paymentAmount: '2,077.60'
    }
];

const props = {
    config: formConfig,
    expenseData,
    invoiceData,
    paymentData
};
st.init(props);
