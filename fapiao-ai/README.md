## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 5.7 (可选)
- Redis >= 5.0 (可选)

2. **安装依赖**
```bash
npm install
```

3. **配置数据库** (可选)
```bash
# 复制配置文件
cp config/config.default.js config/config.local.js

# 编辑配置文件，修改数据库连接信息
vim config/config.local.js
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
```
http://localhost:7001
```

## 📁 项目结构

```
eggjs-template-project/
├── app/
│   ├── controller/          # 控制器
│   │   ├── home.js         # 首页控制器
│   │   ├── health.js       # 健康检查控制器
│   │   └── api/            # API 控制器
│   │       ├── user.js     # 用户 API
│   ├── public/             # 静态资源
│   │   ├── css/           # 样式文件
│   │   ├── js/            # JavaScript 文件
│   │   └── images/        # 图片资源
│   ├── view/              # 模板文件
│   │   ├── index.html     # 首页模板
│   └── router.js          # 路由配置
├── config/
│   ├── config.default.js  # 默认配置
│   └── plugin.js          # 插件配置
├── package.json           # 项目依赖
└── README.md             # 项目说明
```

## 🔧 配置

### 数据库配置

在 `config/config.default.js` 中配置数据库连接：

```javascript
config.mysql = {
    client: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'your_password',
        database: 'your_database',
    },
    app: true,
    agent: false,
};
```

### Redis 配置

```javascript
config.redis = {
    client: {
        port: 6379,
        host: '127.0.0.1',
        password: 'your_password',
        db: 0,
    },
};
```

### 文件上传配置

```javascript
config.multipart = {
    mode: 'file',
    fileSize: '50mb',
    whitelist: ['.jpg', '.jpeg', '.png', '.pdf'],
};
```

## 📚 API 文档

### 系统 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/health` | 健康检查 |

## 🎨 前端功能

## 🚀 部署

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
# 启动生产服务器
npm start

# 停止服务器
npm stop
```

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name eggjs-template

# 查看状态
pm2 status

# 查看日志
pm2 logs eggjs-template
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行代码覆盖率测试
npm run cov

# 运行 ESLint 检查
npm run lint
```

## 📝 开发指南

### 添加新页面

1. 在 `app/view/` 目录下创建模板文件
2. 在 `app/controller/` 目录下创建控制器
3. 在 `app/router.js` 中添加路由配置

### 添加新 API

1. 在 `app/controller/api/` 目录下创建控制器
2. 在 `app/router.js` 中添加 API 路由
3. 添加参数验证和错误处理

### 自定义样式

1. 在 `app/public/css/` 目录下添加 CSS 文件
2. 在模板中引入样式文件