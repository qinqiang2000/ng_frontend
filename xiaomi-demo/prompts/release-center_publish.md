实现页面http://localhost:3000/release-center面板Release Records中发布功能：
功能介绍：
- 可以直接在一行中选择发布，也可以多个行选中然后发布

需要实现的功能：
- 点击数据行中、搜索操作区域的publish按钮时，弹出发布提示框，并且可以在弹出框中输入版本号，然后调用发布接口完成发布
- 发布调用成功后，根据当前条件重新加载列表，如果发布提示异常，使用http://localhost:3000/invoice-rules中统一的提示组件进行异常提示

注意：
- 接口前缀为xm-demo

接口文档：
    # Publish rules in batch

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /invoice-rules/publish:
    post:
      summary: Publish rules in batch
      deprecated: false
      description: Publishes multiple rules with specified version
      operationId: publishRules
      tags:
        - Invoice Rules
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RulePublishRequest'
        required: true
      responses:
        '200':
          description: Successfully published rules
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultString'
          headers: {}
          x-apifox-name: 成功
        '500':
          description: Rule publishing failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResult'
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: Invoice Rules
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-336517170-run
components:
  schemas:
    RulePublishRequest:
      type: object
      description: Rule publish request
      required:
        - ruleCodes
        - version
      properties:
        ruleCodes:
          type: array
          items:
            type: string
          description: List of rule codes to publish
        version:
          type: string
          description: Version number
      x-apifox-orders:
        - ruleCodes
        - version
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    ResultString:
      allOf:
        - $ref: '#/components/schemas/Result'
        - type: object
          properties:
            data:
              type: string
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
    ErrorResult:
      type: object
      description: 错误结果
      properties:
        errcode:
          type: string
          description: 错误代码
          example: '500'
        message:
          type: string
          description: 错误消息
      x-apifox-orders:
        - errcode
        - message
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```