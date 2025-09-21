实现页面http://localhost:3000/release-center顶部Version Release Trends面板中的折线图：
功能介绍：
- 通过折线图表的方式按月显示了进半年发布中心的版本发布趋势

需要实现的功能：
- 查询后台接口数据，提取返回的值，准确的填充折线图表中
- Tax Rules Engine这条折现图先删除，后台也不会返回

注意：
- 字段映射方式注意，后台通过列表的方式返回了信息，例如：[[
    {
        "ruleType": 2,
        "ruleTypeName": "补全",
        "monthlyData": [
            {
                "publishMonth": "2025-08",
                "count": 1
            }
        ]
    }
]]

接口文档：
# Get monthly publish statistics

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /invoice-rules/monthly-publish-statistics:
    get:
      summary: Get monthly publish statistics
      deprecated: false
      description: Retrieves monthly publishing statistics for rules
      operationId: getRuleMonthlyPublishStatistics
      tags:
        - Invoice Rules
      parameters: []
      responses:
        '200':
          description: Successfully retrieved monthly publish statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultRuleMonthlyPublishStatisticsList'
          headers: {}
          x-apifox-name: 成功
        '500':
          description: Failed to query monthly publish statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResult'
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: Invoice Rules
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336517172-run
components:
  schemas:
    ResultRuleMonthlyPublishStatisticsList:
      allOf:
        - $ref: '#/components/schemas/Result'
        - type: object
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/RuleMonthlyPublishStatisticsDto'
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
    RuleMonthlyPublishStatisticsDto:
      type: object
      description: Monthly publish statistics
      properties:
        month:
          type: string
          description: Month (YYYY-MM format)
        publishCount:
          type: integer
          description: Number of rules published in this month
      x-apifox-orders:
        - month
        - publishCount
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