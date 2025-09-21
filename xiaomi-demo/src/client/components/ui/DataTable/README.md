# DataTable 组件使用文档

## 概述

DataTable 是一个基于 Ant Design Table 组件的高度可复用数据表格组件，提供了丰富的功能特性，包括搜索、筛选、排序、分页、数据导出等。

## 特性

- ✅ **基于 Ant Design**: 使用成熟的 UI 库，保证组件稳定性和用户体验
- ✅ **TypeScript 支持**: 完整的类型定义，提供良好的开发体验
- ✅ **搜索和筛选**: 支持多字段搜索和高级筛选
- ✅ **排序功能**: 支持单列排序和多列排序
- ✅ **分页控制**: 灵活的分页配置
- ✅ **数据导出**: 支持 CSV、Excel、JSON 格式导出
- ✅ **列控制**: 动态显示/隐藏列
- ✅ **行选择**: 支持单选和多选
- ✅ **响应式设计**: 适配不同屏幕尺寸
- ✅ **国际化**: 支持多语言
- ✅ **自定义工具栏**: 可扩展的工具栏操作

## 快速开始

### 基础用法

```tsx
import DataTable from '@/client/components/ui/DataTable';
import { DataTableColumn } from '@/client/components/ui/DataTable/types';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: DataTableColumn<User>[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    sortable: true,
    searchable: true
  },
  {
    key: 'email',
    title: '邮箱',
    dataIndex: 'email',
    searchable: true
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    render: (status) => (
      <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>
        {status === 'active' ? '活跃' : '非活跃'}
      </span>
    )
  }
];

const data: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: 'inactive' }
];

function UserTable() {
  return (
    <DataTable
      dataSource={data}
      columns={columns}
      rowKey="id"
    />
  );
}
```

### 带工具栏的表格

```tsx
function UserTableWithToolbar() {
  return (
    <DataTable
      dataSource={data}
      columns={columns}
      rowKey="id"
      toolbar={{
        showSearch: true,
        showFilter: true,
        showExport: true,
        showRefresh: true,
        searchPlaceholder: '搜索用户...',
        searchFields: ['name', 'email'],
        customActions: [
          <button key="add" className="btn btn-primary">
            添加用户
          </button>
        ]
      }}
    />
  );
}
```

### 带分页的表格

```tsx
function PaginatedUserTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <DataTable
      dataSource={data}
      columns={columns}
      rowKey="id"
      pagination={{
        enabled: true,
        current: currentPage,
        pageSize: pageSize,
        total: data.length,
        showSizeChanger: true,
        showQuickJumper: true,
        onChange: (page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }
      }}
    />
  );
}
```

### 行选择功能

```tsx
function SelectableUserTable() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  return (
    <DataTable
      dataSource={data}
      columns={columns}
      rowKey="id"
      rowSelection={{
        enabled: true,
        type: 'checkbox',
        selectedRowKeys,
        onChange: (keys, rows) => {
          setSelectedRowKeys(keys as string[]);
          console.log('选中的行:', rows);
        }
      }}
    />
  );
}
```

## API 文档

### DataTable Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dataSource | T[] | [] | 数据源 |
| columns | DataTableColumn<T>[] | [] | 列配置 |
| rowKey | string \| ((record: T) => string) | 'id' | 行键 |
| toolbar | DataTableToolbarConfig | undefined | 工具栏配置 |
| pagination | DataTablePaginationConfig \| false | true | 分页配置 |
| rowSelection | DataTableRowSelectionConfig<T> | undefined | 行选择配置 |
| loading | DataTableLoadingConfig \| boolean | false | 加载状态 |
| size | 'small' \| 'middle' \| 'large' | 'middle' | 表格尺寸 |
| bordered | boolean | false | 是否显示边框 |
| striped | boolean | true | 是否显示斑马纹 |
| onRowClick | (record: T, index: number) => void | undefined | 行点击事件 |
| onRefresh | () => void | undefined | 刷新事件 |

### DataTableColumn

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| key | string | - | 列键，必填 |
| title | string | - | 列标题，必填 |
| dataIndex | string | key | 数据字段名 |
| width | number \| string | undefined | 列宽度 |
| align | 'left' \| 'center' \| 'right' | 'left' | 对齐方式 |
| sortable | boolean | false | 是否可排序 |
| searchable | boolean | false | 是否可搜索 |
| filterable | boolean | false | 是否可筛选 |
| render | (value, record, index) => ReactNode | undefined | 自定义渲染器 |
| hidden | boolean | false | 是否隐藏 |

### DataTableToolbarConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showSearch | boolean | false | 显示搜索框 |
| showFilter | boolean | false | 显示筛选 |
| showExport | boolean | false | 显示导出 |
| showRefresh | boolean | false | 显示刷新按钮 |
| showColumnToggle | boolean | false | 显示列控制 |
| searchPlaceholder | string | '搜索...' | 搜索框占位符 |
| searchFields | string[] | [] | 搜索字段 |
| customActions | ReactNode[] | [] | 自定义操作按钮 |

## 预配置组件

### StandardTable (标准数据表格)

用于显示标准代码数据的预配置表格组件。

```tsx
import { createStandardTableColumns, getStandardTableConfig } from '@/client/components/ui/DataTable/StandardTableConfig';

const columns = createStandardTableColumns(hasCountry, t);
const config = getStandardTableConfig(t, countryOptions);

<DataTable
  dataSource={standardData}
  columns={columns}
  {...config}
/>
```

### MappingTable (映射数据表格)

用于显示映射关系数据的预配置表格组件。

```tsx
import { createMappingTableColumns, getMappingTableConfig } from '@/client/components/ui/DataTable/MappingTableConfig';

const columns = createMappingTableColumns(hasCountry, t);
const config = getMappingTableConfig(t, countryOptions);

<DataTable
  dataSource={mappingData}
  columns={columns}
  {...config}
/>
```

## 数据导出

DataTable 支持多种格式的数据导出：

### 支持的格式

- **CSV**: 兼容 Excel 的 CSV 格式，支持中文
- **Excel**: 使用 CSV 格式，可用 Excel 打开
- **JSON**: 标准 JSON 格式

### 使用方法

```tsx
// 通过工具栏导出
<DataTable
  dataSource={data}
  columns={columns}
  toolbar={{
    showExport: true
  }}
  export={{
    enabled: true,
    filename: 'my_data',
    formats: ['csv', 'excel', 'json']
  }}
/>

// 编程式导出
import { exportData } from '@/client/components/ui/DataTable/exportUtils';

exportData(data, columns, 'csv', 'my_export.csv');
```

## 样式定制

DataTable 组件已经与项目的 Tailwind CSS 样式系统集成，支持以下定制：

### 主题配置

```tsx
<DataTable
  className="custom-table"
  style={{ border: '1px solid #e5e7eb' }}
  size="small"
  bordered={true}
  striped={false}
/>
```

### CSS 变量

可以通过 CSS 变量覆盖默认样式：

```css
.custom-table {
  --ant-color-primary: #2563eb;
  --ant-border-radius-base: 6px;
}
```

## 国际化

DataTable 支持国际化，使用项目的翻译系统：

```tsx
import { useCodeListsTranslation } from '@/client/hooks/useTranslation';

function MyTable() {
  const { t } = useCodeListsTranslation();

  return (
    <DataTable
      dataSource={data}
      columns={columns}
      locale={{
        emptyText: t('messages.noData'),
        filterTitle: t('common.filter'),
        // ... 更多本地化配置
      }}
    />
  );
}
```

## 性能优化

### 大数据集处理

对于大数据集，建议使用服务端分页：

```tsx
<DataTable
  dataSource={pageData}
  columns={columns}
  pagination={{
    enabled: true,
    current: currentPage,
    pageSize: pageSize,
    total: totalRecords,
    onChange: (page, size) => {
      // 从服务器获取新页面数据
      fetchData(page, size);
    }
  }}
/>
```

### 虚拟滚动

对于列表项很多的情况，可以启用虚拟滚动：

```tsx
<DataTable
  dataSource={data}
  columns={columns}
  scroll={{ y: 400 }}
  pagination={false}
/>
```

## 常见问题

### Q: 如何自定义列渲染？

A: 使用 `render` 函数：

```tsx
{
  key: 'status',
  title: '状态',
  dataIndex: 'status',
  render: (status, record) => (
    <StatusBadge status={status} type={record.type} />
  )
}
```

### Q: 如何处理异步数据加载？

A: 使用 `loading` 属性：

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const result = await fetchData();
    setData(result);
  } finally {
    setLoading(false);
  }
};

<DataTable
  dataSource={data}
  columns={columns}
  loading={loading}
  onRefresh={loadData}
/>
```

### Q: 如何实现服务端搜索和筛选？

A: 使用工具栏的回调函数：

```tsx
<DataTable
  dataSource={data}
  columns={columns}
  toolbar={{
    showSearch: true,
    showFilter: true
  }}
  onSearch={(value) => {
    // 调用 API 进行搜索
    searchData(value);
  }}
  onFilter={(filters) => {
    // 调用 API 进行筛选
    filterData(filters);
  }}
/>
```

## 更新日志

### v1.0.0
- 初始版本
- 基础表格功能
- 搜索、筛选、排序
- 分页控制
- 数据导出
- 行选择
- 国际化支持