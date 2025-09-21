token失效优化：
1、在proxy.ts的调用处理中，如果接口返回errcode为1300，需要再次重新获取token, 获得新token后更新session的ssoUserInfo对象中的accessToken, 并使用新的accessToken重试一次, 重新获取token需要在session的tenantInfo中提取clientId和clientSecret，如果session已经不存在正常进入现在登录失效的处理流程
2、重新获取token的接口文档：
# 获取苍穹Token（安全版本）

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/sso/kingdee/token:
    post:
      summary: 获取苍穹Token（安全版本）
      deprecated: false
      description: >-
        通过安全验证获取苍穹SSO访问令牌。使用MD5签名验证确保请求安全性，支持两种获取方式：原有流程（/kapi/oauth2/getToken）和新的两步流程（getAppToken.do
        -> login.do）。系统会根据租户配置自动选择合适的获取方式。


        ## 安全机制

        - **签名验证**: 使用MD5(appId + secret + timestamp)生成签名

        - **时间戳验证**: 请求必须在5分钟内有效

        - **身份验证**: appId必须与租户配置的clientId匹配

        - **防重放**: 通过时间戳限制防止重放攻击


        ## 签名算法

        1. 将appId、secret、timestamp按顺序拼接: `appId + secret + timestamp`

        2. 对拼接字符串进行MD5哈希: `MD5("app123secret456789123456789000")`

        3. 得到32位小写MD5签名: `"abc123def456789..."`
      tags:
        - SSO
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SecureTokenRequest'
            examples:
              example1:
                value:
                  domain: kingdee
                  appId: your_app_id
                  timestamp: 1726827600000
                  sign: abc123def456789012345678901234567
                summary: 标准请求示例
        required: true
      responses:
        '200':
          description: 请求处理结果
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/TokenSuccessResponse'
                  - $ref: '#/components/schemas/TokenErrorResponse'
              examples:
                '1':
                  summary: 成功获取Token
                  value:
                    code: '200'
                    message: Token retrieved successfully
                    success: true
                    data:
                      accessToken: >-
                        eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                      tokenType: Bearer
                      expiresIn: 7200
                      domain: kingdee
                '2':
                  summary: 签名验证失败
                  value:
                    code: '401001'
                    message: Invalid signature
                    success: false
                    data: null
                '3':
                  summary: 时间戳过期
                  value:
                    code: '401002'
                    message: Timestamp is invalid or expired
                    success: false
                    data: null
          headers: {}
          x-apifox-name: 成功
        '400':
          description: 参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenErrorResponse'
              example:
                code: '400001'
                message: Domain is required
                success: false
                data: null
          headers: {}
          x-apifox-name: 请求有误
        '500':
          description: 服务器内部错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenErrorResponse'
          headers: {}
          x-apifox-name: 服务器错误
      security: []
      x-apifox-folder: SSO
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/6934009/apis/api-348511765-run
components:
  schemas:
    SecureTokenRequest:
      type: object
      required:
        - domain
        - appId
        - timestamp
        - sign
      properties:
        domain:
          type: string
          description: 租户域名，用于查询租户配置信息
          minLength: 1
          example: kingdee
        appId:
          type: string
          description: 应用ID，必须与租户配置的clientId匹配
          minLength: 1
          example: your_app_id
        timestamp:
          type: integer
          format: int64
          description: 时间戳（毫秒），用于防重放攻击，有效期5分钟
          minimum: 1
          example: 1726827600000
        sign:
          type: string
          description: 'MD5签名，计算方式: MD5(appId + secret + timestamp)'
          minLength: 32
          maxLength: 32
          pattern: ^[a-fA-F0-9]{32}$
          example: abc123def456789012345678901234567
      x-apifox-orders:
        - domain
        - appId
        - timestamp
        - sign
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    TokenSuccessResponse:
      type: object
      properties:
        code:
          type: string
          description: 响应状态码
          example: '200'
        message:
          type: string
          description: 响应消息
          example: Token retrieved successfully
        data:
          $ref: '#/components/schemas/KingdeeSsoUserInfo'
        success:
          type: boolean
          description: 操作是否成功
          example: true
      x-apifox-orders:
        - code
        - message
        - data
        - success
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    TokenErrorResponse:
      type: object
      properties:
        code:
          type: string
          description: 错误状态码
          enum:
            - '400001'
            - '400002'
            - '400003'
            - '400004'
            - '401001'
            - '401002'
            - '401003'
            - '401004'
            - '401005'
            - '404001'
            - '500001'
          example: '401001'
        message:
          type: string
          description: 错误消息
          example: Invalid signature
        data:
          type: object
          description: 错误时通常为null
          x-apifox-orders: []
          properties: {}
          x-apifox-ignore-properties: []
          nullable: true
        success:
          type: boolean
          description: 操作是否成功
          example: false
      x-apifox-orders:
        - code
        - message
        - data
        - success
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    KingdeeSsoUserInfo:
      type: object
      description: 苍穹SSO用户信息和Token信息
      properties:
        accessToken:
          type: string
          description: 访问令牌
          example: eyJhbGciOiJIUzI1NiJ9...
        tokenType:
          type: string
          description: 令牌类型
          example: Bearer
        expiresIn:
          type: integer
          format: int64
          description: 令牌有效期（秒）
          example: 7200
        domain:
          type: string
          description: 租户域名
          example: kingdee
        userId:
          type: string
          description: 用户ID
          nullable: true
          example: '1001'
        userName:
          type: string
          description: 用户名
          nullable: true
          example: admin
        orgId:
          type: string
          description: 组织ID
          nullable: true
          example: ORG001
        orgName:
          type: string
          description: 组织名称
          nullable: true
          example: 总公司
      required:
        - accessToken
        - tokenType
        - expiresIn
      x-apifox-orders:
        - accessToken
        - tokenType
        - expiresIn
        - domain
        - userId
        - userName
        - orgId
        - orgName
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
  securitySchemes: {}
servers:
  - url: http://api-sit.piaozone.com/xm-demo
    description: 测试环境
security: []

```