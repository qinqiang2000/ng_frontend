实现页面http://localhost:3000/invoice-results中Tax Authority Filing Performance面板中的功能：
功能介绍：
- 用折线图显示开票的Performance

需要实现的功能：
- 查询开票Performance的后台接口数据，然后在Tax Authority Filing Performance的面板中显示折线图数据

注意：
- 接口前缀为xm-demo

接口文档：
# Get hourly statistics for invoice statuses

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/invoice/hourly-stats:
    get:
      summary: Get hourly statistics for invoice statuses
      deprecated: false
      description: >-
        Returns statistics for the last 24 hours grouped by invoice status and
        hour
      operationId: getHourlyStatusStats
      tags:
        - Invoice
        - Invoice Statistics
      parameters: []
      responses:
        '200':
          description: Successful response with hourly statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HourlyStatsResponse'
              example:
                errcode: '200'
                message: Success
                data:
                  - status: 1
                    statusName: InvoiceReady
                    hourlyData:
                      '2024-01-15 00:00:00': 5
                      '2024-01-15 01:00:00': 3
                      '2024-01-15 02:00:00': 8
                  - status: 2
                    statusName: Reporting
                    hourlyData:
                      '2024-01-15 00:00:00': 2
                      '2024-01-15 01:00:00': 1
                      '2024-01-15 02:00:00': 4
          headers: {}
          x-apifox-name: 成功
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: Invoice
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336884743-run
components:
  schemas:
    HourlyStatsResponse:
      type: object
      properties:
        errcode:
          type: string
          description: Response code
          example: '200'
        message:
          type: string
          description: Response message
          example: Success
        data:
          type: array
          items:
            $ref: '#/components/schemas/StatusHourlyStats'
        traceId:
          type: string
          description: Trace ID for request tracking
      x-apifox-orders:
        - errcode
        - message
        - data
        - traceId
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    StatusHourlyStats:
      type: object
      description: Hourly statistics grouped by invoice status
      properties:
        status:
          type: integer
          description: Invoice status code
          enum:
            - 1
            - 2
            - 3
            - 4
            - 5
            - 6
            - 7
          example: 1
        statusName:
          type: string
          description: Invoice status name
          enum:
            - InvoiceReady
            - Reporting
            - Reported
            - ReportFailed
            - Delivering
            - Delivered
            - DeliverFailed
          example: InvoiceReady
        hourlyData:
          type: object
          description: Hourly data mapping (hour -> count)
          additionalProperties:
            type: integer
            format: int64
            minimum: 0
          x-apifox-orders: []
          properties: {}
          x-apifox-ignore-properties: []
          example:
            '2024-01-15 00:00:00': 5
            '2024-01-15 01:00:00': 3
            '2024-01-15 02:00:00': 8
      required:
        - status
        - statusName
        - hourlyData
      x-apifox-orders:
        - status
        - statusName
        - hourlyData
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    ErrorResponse:
      type: object
      properties:
        errcode:
          type: string
          description: Error code
          example: '500'
        message:
          type: string
          description: Error message
          example: Internal server error
        traceId:
          type: string
          description: Trace ID for request tracking
      x-apifox-orders:
        - errcode
        - message
        - traceId
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```