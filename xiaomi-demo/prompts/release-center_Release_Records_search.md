实现页面http://localhost:3000/release-center中Release Records页签中的查询功能：

功能介绍：
- 该功能为分页查询的发布记录

需要实现的功能：
- 支持查询的Engine Type为all、2-Invoice Enrichment Engine、1-Invoice Validation Engine，并且支持空字符串查询all, 对接接口的ruleType字段
- 支持查询的status为(1=Draft，2=TestPassed，3=Published，4=actived，5=Deactivate)和空字符串表示all
- 输入搜索条件时传入接口的ruleName参数
- 当搜索条件发生变化时，重新加载列表数据
- 列表中列名Impact Scope修改为invoiceType/subInvoiceType, 这一列的数据行按照两行分别显示这两个字段的值，步修改现在的显示效果保持第一行和二行文字效果
- 删除Approver这一列
- Actions这一列值显示一个发布按钮
- 每一行开始增加一个选择框，支持多选，并且只能选择TestPassed状态的行
- 在搜索框右边增加一个发布按钮

注意：
- 需要注意列表与返回的数据对应关系：Release Code：ruleCode、Release Name：ruleName、Engine Type： ruleType

接口文档：
# 分页查询发布列表

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /invoice-rules/page:
    post:
      summary: 分页查询规则列表
      deprecated: false
      description: 根据查询条件分页查询发票规则列表
      operationId: queryRulesByPage
      tags:
        - Invoice Rules
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InvoiceRulesQuery'
            example:
              pageNum: 1
              pageSize: 10
              ruleCode: RULE_001
              ruleName: 税率计算规则
              status: ACTIVE
              companyId: 12345
              ruleType: TAX_CALCULATION
              createTimeStart: '2024-01-01T00:00:00'
              createTimeEnd: '2024-12-31T23:59:59'
        required: true
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultPage'
              example:
                code: '200'
                msg: 操作成功
                data:
                  - id: 1
                    ruleCode: RULE_001
                    ruleName: 税率计算规则
                    ruleExpression: taxRate * baseAmount
                    status: ACTIVE
                    companyId: 12345
                    ruleType: TAX_CALCULATION
                    createTime: '2024-01-15T10:30:00'
                    updateTime: '2024-01-20T15:45:00'
                    version: 1.0.0
                    description: 用于计算发票税额的规则
                total: 1
                pageNum: 1
                pageSize: 10
                totalPages: 1
          headers: {}
          x-apifox-name: 成功
        '500':
          description: 服务器内部错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResultPage'
              example:
                code: '500'
                msg: 查询规则列表失败：数据库连接异常
                data: null
                total: 0
                pageNum: 0
                pageSize: 0
                totalPages: 0
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: Invoice Rules
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336517173-run
components:
  schemas:
    InvoiceRulesQuery:
      type: object
      description: 发票规则查询条件
      properties:
        pageNum:
          type: integer
          description: 页码，从1开始
          minimum: 1
          example: 1
        pageSize:
          type: integer
          description: 每页大小
          minimum: 1
          maximum: 100
          example: 10
        ruleCode:
          type: string
          description: 规则编码，支持模糊查询
          example: RULE_001
        ruleName:
          type: string
          description: 规则名称，支持模糊查询
          example: 税率计算规则
        status:
          type: string
          description: 规则状态
          enum:
            - ACTIVE
            - INACTIVE
            - DRAFT
            - PUBLISHED
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
        createTimeStart:
          type: string
          format: date-time
          description: 创建时间范围开始
          example: '2024-01-01T00:00:00'
        createTimeEnd:
          type: string
          format: date-time
          description: 创建时间范围结束
          example: '2024-12-31T23:59:59'
      required:
        - pageNum
        - pageSize
      x-apifox-orders:
        - pageNum
        - pageSize
        - ruleCode
        - ruleName
        - status
        - companyId
        - ruleType
        - createTimeStart
        - createTimeEnd
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
    ErrorResultPage:
      type: object
      description: 错误分页结果响应
      properties:
        code:
          type: string
          description: 错误码
          example: '500'
        msg:
          type: string
          description: 错误消息
          example: 查询规则列表失败：数据库连接异常
        data:
          type: object
          description: 数据，错误时为null
          x-apifox-orders: []
          properties: {}
          x-apifox-ignore-properties: []
          nullable: true
          example: null
        total:
          type: integer
          description: 总记录数，错误时为0
          example: 0
        pageNum:
          type: integer
          description: 当前页码，错误时为0
          example: 0
        pageSize:
          type: integer
          description: 每页大小，错误时为0
          example: 0
        totalPages:
          type: integer
          description: 总页数，错误时为0
          example: 0
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
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```