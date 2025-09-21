实现页面http://localhost:3000/release-center顶部Release Center面板中卡片统计：
功能介绍：
- 通过卡片的方式显示了发布中心的关键统计信息

需要实现的功能：
- 查询后台接口数据，提取返回的值，准确的填充在每个卡片中
- 删除Release Center右侧的"Create Release"按钮
- 卡片的顺序调整为：Published、Active Versions、TestPassed、Draft, 卡片上的文字也调整为这些，并且选择合适的图标，其它多余的图标请删除
- 接口前缀为xm-demo

注意：
- Monthly Releases卡片不需要显示右上角的数字
- Success Rate卡片不需要显示右上角的百分比
- 字段映射方式注意，后台通过列表的方式返回了信息，未返回的默认count默认为0，例如：[
    {
        "statusKey": "Draft",
        "statusName": "草稿",
        "count": 27
    },
    {
        "statusKey": "TestPassed",
        "statusName": "测试通过",
        "count": 2
    },
    {
        "statusKey": "Published",
        "statusName": "已发布",
        "count": 1
    },
    {
        "statusKey": "actived",
        "statusName": "已激活",
        "count": 1
    }
]

接口文档：
# Get rule status statistics

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /invoice-rules/status-statistics:
    get:
      summary: Get rule status statistics
      deprecated: false
      description: Retrieves statistics about rule statuses
      operationId: getRuleStatusStatistics
      tags:
        - Invoice Rules
      parameters: []
      responses:
        '200':
          description: Successfully retrieved rule status statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultRuleStatusStatisticsList'
          headers: {}
          x-apifox-name: 成功
        '500':
          description: Failed to query rule status statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResult'
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: Invoice Rules
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336517171-run
components:
  schemas:
    ResultRuleStatusStatisticsList:
      allOf:
        - $ref: '#/components/schemas/Result'
        - type: object
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/RuleStatusStatisticsDto'
          x-apifox-orders:
            - data
          x-apifox-ignore-properties: []
      x-apifox-folder: ''
    Result:
      type: object
      description: Standard API response wrapper
      properties:
        code:
          type: string
          description: Response code
        message:
          type: string
          description: Response message
        success:
          type: boolean
          description: Whether the operation was successful
      x-apifox-orders:
        - code
        - message
        - success
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    RuleStatusStatisticsDto:
      type: object
      description: Rule status statistics
      properties:
        status:
          type: string
          description: Rule status
        count:
          type: integer
          description: Count of rules with this status
      x-apifox-orders:
        - status
        - count
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    ErrorResult:
      allOf:
        - $ref: '#/components/schemas/Result'
        - type: object
          properties:
            data:
              type: 'null'
          x-apifox-orders:
            - data
          x-apifox-ignore-properties: []
      x-apifox-folder: ''
  securitySchemes: {}
servers:
  - url: http://172.21.237.140:12007/xm-demo
    description: 本地环境_Qiang Copy
security: []

```