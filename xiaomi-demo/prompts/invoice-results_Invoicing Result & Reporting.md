在页面http://localhost:3000/invoice-results中对接Invoicing Result & Reporting和Invoice Status Distribution相关的统计功能，具体要求如下：

功能说明：
- 这个Invoicing Result & Reporting面板通过卡片的方式显示了各个维度的统计数量或税额情况

需要实现的功能
- 需要修改为通过后台接口获取真实数据并正常显示，具体文档参考接口文档说明。
- 卡片展示优化：卡片上面不需要显示百分比，Total Tax Amount的卡片换行了，需要和其它卡片保持在一行
- Invoicing Result & Reporting面板中删除Batch Report和Export Report按钮。
- 实现Invoice Status Distribution面板中的图标显示，数据来源和Invoicing Result & Reporting的数据来源相同，只是没有Total Tax Amount字段信息

注意：
- Total Tax Amount是另外的接口来源，先不对接

注意：
- 字段映射方式注意，后台通过key map这种方式返回，接口返回例如：{
    "errcode": "0000",
    "data": {
        "DeliverFailed": {
            "value": 0
        },
        "ReportFailed": {
            "value": 0
        },
        "Delivering": {
            "value": 0
        },
        "Delivered": {
            "value": 0
        },
        "InvoiceReady": {
            "value": 1
        },
        "Reported": {
            "value": 0
        },
        "Reporting": {
            "value": 1
        }
    },
    "traceId": "a62092e87a08d108",
    "message": "Success",
    "errorMsgArray": [],
    "success": true,
    "error": false
}

- Invoice Status Distribution面板中的数据和Invoicing Result & Reporting面板中的数据可以共用，不要重复调用。

接口文档说明：
# Get invoice count by status

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/invoice/status-count:
    get:
      summary: Get invoice count by status
      deprecated: false
      description: ''
      operationId: getInvoiceStatusCount
      tags:
        - Invoice
      parameters: []
      responses:
        '200':
          description: Status count statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StatusCountResult'
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: Invoice
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336252908-run
components:
  schemas:
    StatusCountResult:
      allOf:
        - $ref: '#/components/schemas/Result'
        - type: object
          properties:
            data:
              type: object
              additionalProperties:
                type: integer
                format: int64
              description: Status count map
              x-apifox-orders: []
              properties: {}
              x-apifox-ignore-properties: []
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
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```