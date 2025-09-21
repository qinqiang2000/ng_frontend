/**
 * DataTable 组件使用示例
 *
 * 本文件包含了 DataTable 组件的各种使用场景和配置示例
 */

'use client';

import React, { useState } from 'react';
import DataTable from './DataTable';
import { DataTableColumn } from './types';
import StatusBadge from '../StatusBadge';

// 示例数据类型定义
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    status: 'active' | 'inactive' | 'pending';
    createTime: string;
    lastLogin?: string;
    department: string;
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'available' | 'out_of_stock' | 'discontinued';
    rating: number;
}

// 示例数据
const sampleUsers: User[] = [
    {
        id: '1',
        name: '张三',
        email: 'zhangsan@example.com',
        role: 'admin',
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        lastLogin: '2024-01-20 09:15:00',
        department: '技术部'
    },
    {
        id: '2',
        name: '李四',
        email: 'lisi@example.com',
        role: 'user',
        status: 'active',
        createTime: '2024-01-16 14:20:00',
        lastLogin: '2024-01-19 16:45:00',
        department: '市场部'
    },
    {
        id: '3',
        name: '王五',
        email: 'wangwu@example.com',
        role: 'user',
        status: 'inactive',
        createTime: '2024-01-17 09:10:00',
        department: '财务部'
    },
    {
        id: '4',
        name: '赵六',
        email: 'zhaoliu@example.com',
        role: 'guest',
        status: 'pending',
        createTime: '2024-01-18 11:30:00',
        department: '人事部'
    }
];

const sampleProducts: Product[] = [
    {
        id: 'P001',
        name: '苹果 iPhone 15',
        category: '手机',
        price: 5999,
        stock: 50,
        status: 'available',
        rating: 4.8
    },
    {
        id: 'P002',
        name: '三星 Galaxy S24',
        category: '手机',
        price: 4999,
        stock: 0,
        status: 'out_of_stock',
        rating: 4.5
    },
    {
        id: 'P003',
        name: '华为 MateBook X',
        category: '笔记本',
        price: 8999,
        stock: 25,
        status: 'available',
        rating: 4.6
    },
    {
        id: 'P004',
        name: '戴尔 XPS 13',
        category: '笔记本',
        price: 9999,
        stock: 15,
        status: 'discontinued',
        rating: 4.4
    }
];

// 示例1: 基础用户表格
export const BasicUserTable: React.FC = () => {
    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
            width: 120,
            sortable: true,
            searchable: true
        },
        {
            key: 'email',
            title: '邮箱',
            dataIndex: 'email',
            searchable: true,
            ellipsis: true
        },
        {
            key: 'role',
            title: '角色',
            dataIndex: 'role',
            width: 100,
            render: (role: string) => {
                const roleColors = {
                    admin: 'bg-red-100 text-red-800',
                    user: 'bg-blue-100 text-blue-800',
                    guest: 'bg-gray-100 text-gray-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[role as keyof typeof roleColors]}`}>
                        {role === 'admin' ? '管理员' : role === 'user' ? '用户' : '访客'}
                    </span>
                );
            },
            filterable: true,
            filters: [
                { text: '管理员', value: 'admin' },
                { text: '用户', value: 'user' },
                { text: '访客', value: 'guest' }
            ]
        },
        {
            key: 'status',
            title: '状态',
            dataIndex: 'status',
            width: 100,
            align: 'center',
            render: (status: string) => <StatusBadge status={status} />
        },
        {
            key: 'department',
            title: '部门',
            dataIndex: 'department',
            width: 120
        }
    ];

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">基础用户表格示例</h3>
            <DataTable
                dataSource={sampleUsers}
                columns={columns}
                rowKey="id"
            />
        </div>
    );
};

// 示例2: 带工具栏的产品表格
export const ProductTableWithToolbar: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const columns: DataTableColumn<Product>[] = [
        {
            key: 'name',
            title: '产品名称',
            dataIndex: 'name',
            searchable: true,
            ellipsis: true
        },
        {
            key: 'category',
            title: '分类',
            dataIndex: 'category',
            width: 100,
            filterable: true,
            filters: [
                { text: '手机', value: '手机' },
                { text: '笔记本', value: '笔记本' }
            ]
        },
        {
            key: 'price',
            title: '价格',
            dataIndex: 'price',
            width: 120,
            align: 'right',
            sortable: true,
            render: (price: number) => `¥${price.toLocaleString()}`
        },
        {
            key: 'stock',
            title: '库存',
            dataIndex: 'stock',
            width: 80,
            align: 'center',
            sortable: true,
            render: (stock: number) => (
                <span className={stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stock}
                </span>
            )
        },
        {
            key: 'rating',
            title: '评分',
            dataIndex: 'rating',
            width: 100,
            align: 'center',
            render: (rating: number) => (
                <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span>{rating}</span>
                </div>
            )
        },
        {
            key: 'status',
            title: '状态',
            dataIndex: 'status',
            width: 120,
            align: 'center',
            render: (status: string) => <StatusBadge status={status} />
        }
    ];

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">带工具栏的产品表格示例</h3>
            <DataTable
                dataSource={sampleProducts}
                columns={columns}
                rowKey="id"
                loading={loading}
                toolbar={{
                    showSearch: true,
                    showFilter: true,
                    showExport: true,
                    showRefresh: true,
                    showColumnToggle: true,
                    searchPlaceholder: '搜索产品...',
                    searchFields: ['name', 'category'],
                    filterFields: [
                        {
                            key: 'category',
                            label: '分类',
                            type: 'select',
                            options: [
                                { label: '全部分类', value: '' },
                                { label: '手机', value: '手机' },
                                { label: '笔记本', value: '笔记本' }
                            ]
                        },
                        {
                            key: 'priceRange',
                            label: '价格范围',
                            type: 'select',
                            options: [
                                { label: '全部价格', value: '' },
                                { label: '5000以下', value: 'low' },
                                { label: '5000-8000', value: 'medium' },
                                { label: '8000以上', value: 'high' }
                            ]
                        }
                    ],
                    customActions: [
                        <button
                            key="add"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <i className="ri-add-line"></i>
                            添加产品
                        </button>
                    ]
                }}
                onRefresh={handleRefresh}
                export={{
                    enabled: true,
                    filename: 'products',
                    formats: ['csv', 'excel']
                }}
            />
        </div>
    );
};

// 示例3: 带分页和行选择的用户表格
export const PaginatedSelectableUserTable: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    // 生成更多示例数据
    const generateUsers = (count: number): User[] => {
        const users: User[] = [];
        const departments = ['技术部', '市场部', '财务部', '人事部', '运营部'];
        const roles = ['admin', 'user', 'guest'] as const;
        const statuses = ['active', 'inactive', 'pending'] as const;

        for (let i = 1; i <= count; i++) {
            users.push({
                id: i.toString(),
                name: `用户${i}`,
                email: `user${i}@example.com`,
                role: roles[i % 3],
                status: statuses[i % 3],
                createTime: `2024-01-${(i % 28) + 1} 10:30:00`,
                lastLogin: i % 3 === 0 ? undefined : `2024-01-${(i % 28) + 1} 16:45:00`,
                department: departments[i % 5]
            });
        }
        return users;
    };

    const allUsers = generateUsers(20);

    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
            searchable: true
        },
        {
            key: 'email',
            title: '邮箱',
            dataIndex: 'email',
            searchable: true
        },
        {
            key: 'role',
            title: '角色',
            dataIndex: 'role',
            render: (role: string) => {
                const roleMap = { admin: '管理员', user: '用户', guest: '访客' };
                return roleMap[role as keyof typeof roleMap];
            }
        },
        {
            key: 'department',
            title: '部门',
            dataIndex: 'department'
        },
        {
            key: 'status',
            title: '状态',
            dataIndex: 'status',
            render: (status: string) => <StatusBadge status={status} />
        }
    ];

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">带分页和行选择的用户表格示例</h3>

            {/* 选择信息显示 */}
            {selectedRowKeys.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-800">
                        已选择 {selectedRowKeys.length} 个用户
                        <button
                            onClick={() => setSelectedRowKeys([])}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                            取消选择
                        </button>
                    </p>
                </div>
            )}

            <DataTable
                dataSource={allUsers}
                columns={columns}
                rowKey="id"
                pagination={{
                    enabled: true,
                    current: currentPage,
                    pageSize: pageSize,
                    total: allUsers.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: true,
                    pageSizeOptions: ['2', '5', '10', '20'],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }
                }}
                rowSelection={{
                    enabled: true,
                    type: 'checkbox',
                    selectedRowKeys,
                    onChange: (keys, rows) => {
                        setSelectedRowKeys(keys as string[]);
                        console.log('选中的用户:', rows);
                    },
                    getCheckboxProps: (record) => ({
                        disabled: record.status === 'inactive'
                    })
                }}
                toolbar={{
                    showSearch: true,
                    searchPlaceholder: '搜索用户姓名或邮箱...'
                }}
                onRowClick={(record) => {
                    console.log('点击了用户:', record);
                }}
            />
        </div>
    );
};

// 示例4: 自定义样式表格
export const CustomStyledTable: React.FC = () => {
    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
            width: 120
        },
        {
            key: 'email',
            title: '邮箱',
            dataIndex: 'email'
        },
        {
            key: 'createTime',
            title: '创建时间',
            dataIndex: 'createTime',
            width: 180,
            render: (time: string) => new Date(time).toLocaleDateString()
        },
        {
            key: 'actions',
            title: '操作',
            dataIndex: 'actions',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                        编辑
                    </button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">
                        删除
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">自定义样式表格示例</h3>
            <DataTable
                dataSource={sampleUsers}
                columns={columns}
                rowKey="id"
                size="small"
                bordered={true}
                striped={false}
                className="shadow-lg"
                style={{ borderRadius: '8px', overflow: 'hidden' }}
                scroll={{ x: 600 }}
            />
        </div>
    );
};

// 示例5: 空状态表格
export const EmptyTable: React.FC = () => {
    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            title: '姓名',
            dataIndex: 'name'
        },
        {
            key: 'email',
            title: '邮箱',
            dataIndex: 'email'
        },
        {
            key: 'status',
            title: '状态',
            dataIndex: 'status'
        }
    ];

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">空状态表格示例</h3>
            <DataTable
                dataSource={[]}
                columns={columns}
                rowKey="id"
                toolbar={{
                    showSearch: true,
                    customActions: [
                        <button
                            key="add"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <i className="ri-add-line"></i>
                            添加第一个用户
                        </button>
                    ]
                }}
            />
        </div>
    );
};

// 示例集合组件
export const DataTableExamples: React.FC = () => {
    const [activeExample, setActiveExample] = useState(0);

    const examples = [
        { title: '基础表格', component: BasicUserTable },
        { title: '带工具栏表格', component: ProductTableWithToolbar },
        { title: '分页和选择', component: PaginatedSelectableUserTable },
        { title: '自定义样式', component: CustomStyledTable },
        { title: '空状态', component: EmptyTable }
    ];

    const CurrentExample = examples[activeExample].component;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-2xl font-bold py-6">DataTable 组件示例</h1>
                    <div className="flex space-x-1">
                        {examples.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveExample(index)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeExample === index
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {example.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto">
                <CurrentExample />
            </div>
        </div>
    );
};