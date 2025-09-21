实现页面http://localhost:3000/invoice-results中Invoice Results List面板中的查询功能：

功能介绍：
- 该功能为分页查询发票的开票结果

需要实现的功能：
- 搜索条件中status Filter，status状态包括：(1-InvoiceReady, 2-Reporting, 3-Reported, 4-ReportFailed, 5-Delivering, 6-Delivered, 7-DeliverFailed), 帮忙检查现在的枚举值、描述，按照这个顺序和枚举值优化这个选项，也需要支持All status，all status对应的值为空字符串。
- Time Range的选择框选择某个值时，需要转换为startTime和endTime再调用接口
- 右侧的输入框对应的接口参数为invoiceNo，placeholder也帮忙优化一下
- 搜索条件变化就触发查询，显示最新的列表
- Result ID这一列显示改为显示Invoice Number
- Company Name这一列第一行显示的字段对应sendCompanyName，第二行的字段对应country
- Invoice Information这一列只显示一行totalAmount，这个需要通过返回的currency转换为对应的货币符号在加上金额一起显示，这个功能在http://localhost:3000/invoice-requests的Invoice Request List中已经实现，尽量共用
- Tax Information这一列第一行显示invoiceType/invoiceSubType, 第二行显示税额taxAmount，税额也需要和totalAmount一样通过currency转换为对应的货币符号合并后显示
- 列表项现在前端显示了三个Filing Status、Invoice Status、Delivery Status，需要合并为一个status
- Filing Date这一列改为显示Issue Date
- Actions只需要支持查看，下载发票PDF的功能，其它的按钮图标可以删除，查看和下载功能后续点击提示开发中

注意：
- 列表返回了一个id，这个后续查看和下载都需要使用需要前端记录好
- 查询参数中的startTime和endTime需要根据本地时区生成对应的参数格式，示例：2025-07-23T16:00:00.000+00:00
- 列表数据的Filing Date，后台返回的格式也是：2025-07-23T16:00:00.000+00:00这种格式，需要转换为现在前端的格式显示，显示时需要转换为本地时区显示
- 接口前缀为xm-demo

接口文档：
# Query invoices with pagination

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/invoice/page:
    post:
      summary: Query invoices with pagination
      deprecated: false
      description: ''
      operationId: queryInvoiceByPage
      tags:
        - Invoice
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InvoiceQuery'
        required: true
      responses:
        '200':
          description: Paginated invoice results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultPage'
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: Invoice
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336252907-run
components:
  schemas:
    InvoiceQuery:
      type: object
      properties:
        pageNum:
          type: integer
          default: 1
          description: Page number, starts from 1
        pageSize:
          type: integer
          default: 10
          description: Page size
        companyId:
          type: string
          description: Company ID
        invoiceType:
          type: string
          description: Invoice type
        invoiceSubType:
          type: string
          description: Invoice sub type
        submissionType:
          type: string
          description: Submission type
        invoiceNo:
          type: string
          description: Invoice number
        sendCompanyId:
          type: string
          description: Seller company ID
        receiveCompanyId:
          type: string
          description: Buyer company ID
        sendCompanyName:
          type: string
          description: Seller company name
        status:
          type: integer
          description: Invoice comprehensive status
      x-apifox-orders:
        - pageNum
        - pageSize
        - companyId
        - invoiceType
        - invoiceSubType
        - submissionType
        - invoiceNo
        - sendCompanyId
        - receiveCompanyId
        - sendCompanyName
        - status
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    ResultPage:
      type: object
      description: 分页结果响应
      properties:
        code:
          type: string
          description: 响应码
          example: '200'
        msg:
          type: string
          description: 响应消息
          example: 操作成功
        data:
          type: array
          description: 数据列表
          items:
            $ref: '#/components/schemas/InvoiceRules'
        total:
          type: integer
          format: int64
          description: 总记录数
          example: 1
        pageNum:
          type: integer
          description: 当前页码
          example: 1
        pageSize:
          type: integer
          description: 每页大小
          example: 10
        totalPages:
          type: integer
          description: 总页数
          example: 1
      x-apifox-orders:
        - code
        - msg
        - data
        - total
        - pageNum
        - pageSize
        - totalPages
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    InvoiceRules:
      type: object
      description: 发票规则实体
      properties:
        id:
          type: integer
          format: int64
          description: 主键ID
          example: 1
        ruleCode:
          type: string
          description: 规则编码
          example: RULE_001
        ruleName:
          type: string
          description: 规则名称
          example: 税率计算规则
        ruleExpression:
          type: string
          description: 规则表达式
          example: taxRate * baseAmount
        status:
          type: string
          description: 规则状态
          example: ACTIVE
        companyId:
          type: integer
          format: int64
          description: 企业ID
          example: 12345
        ruleType:
          type: string
          description: 规则类型
          example: TAX_CALCULATION
        createTime:
          type: string
          format: date-time
          description: 创建时间
          example: '2024-01-15T10:30:00'
        updateTime:
          type: string
          format: date-time
          description: 更新时间
          example: '2024-01-20T15:45:00'
        version:
          type: string
          description: 版本号
          example: 1.0.0
        description:
          type: string
          description: 规则描述
          example: 用于计算发票税额的规则
      x-apifox-orders:
        - id
        - ruleCode
        - ruleName
        - ruleExpression
        - status
        - companyId
        - ruleType
        - createTime
        - updateTime
        - version
        - description
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```