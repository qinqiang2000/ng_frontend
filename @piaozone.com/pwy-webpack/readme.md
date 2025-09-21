# 发票云前端打包工具

## 全局安装打包工具

```bash

# 先设置npm包的查找路径
$ npm config set registry https://registry.npm.taobao.org

# 然后安装全局安装@piaozone.com/pwy-webpack，后续项目里面只关注业务包
$ npm install @piaozone.com/pwy-webpack --registry=http://172.18.1.117:7001 -g

```

## 调用方法

**注意先配置好：NODE_PATH 这个环境变量

windows路径类似：C:\Users\Administrator\AppData\Roaming\npm\node_modules

linux路径类似：/var/datadisk/tools/node-v12.14.0-linux-x64/lib/node_modules

```bash

# 打包命令, progress为显示进度
$ pwy-webpack --build --config=./buildConfig.js --progress

# 启动devServer, devServer默认9000端口
$ pwy-webpack --dev --config=./buildConfig.js

# js检测, 参数和eslint命令行一致，但默认增加了发票云自身的eslint规则, 如
$ pwy-eslint --ext .js,.jsx src

# css检测, 参数和stylelint命令行一致,但默认增加了发票云自身的stylelint规则，如
$ pwy-stylelint src/**/*.less src/**/*.css

# 初始化项目，支持五种类型['antd-dva', 'antd-mobile-dva', 'egg-antd-dva' ,'egg-antd-mobile-dva', 'lib', 'react-com']
# lib类型可以生成一个es6 lib的目录，打包后会在dist生成非压缩和压缩后的文件，可用于reuire和script标签引入
# 注意egg类型的项目部署时需要把生成的manifest.json复制到config目录里面，启动是会检测这个文件，本地开发不用
# 在空目录里面初始化项目
$ pwy-webpack --init --type=antd-dva --install

# 指定项目名称
$ pwy-webpack --init --type=antd-dva --install --project-name=test-antd-dva

# 安装完成后，启动本地调试
$ npm run dev

# 安装完成后，启动打包build
$ npm run build

# 安装npm包命令, 还支持--production用于只安装线上环境的包，--registry支持修改发票云的源地址，默认117的地址 --only用于包含匹配安装，没有则全部安装，对于发票云的源会自动选择117
$ pwy-webpack -i --only=piaozone

# 进项单元测试
# --config可以自定义config文件，
# 注意目录结构目前默认src为源码，test为测试目录，输出覆盖率信息的目录时当前项目目录的coverage输出覆盖率信息的目录时当前项目目录的coverage
$ pwy-jest

```

## buildConfig.js 配置详情

**注意：**

**1、每个入口必须包含自己模板文件index.html，与index.js同级**

**2、会固定生成：vendor.js、libs.js、commons.js、index.html、manifest.json**

```js

const path = require('path');
const srcDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');

/*
    自定义忽略文件，可以不传，默认会忽略（node_modules、logs、dist、run、mock、public）
    eslintignore: path.join(rootDir, '.eslintignore')
    stylelintignore: path.join(rootDir, '.stylelintignore')
    eslintDir: '', // 指定eslintDir，如果不指定默认使用srcDir作为检查根目录
    stylelintDir: '', // 指定stylelintDir，如果不指定默认使用srcDir作为检查根目录
    devServer: // 自定义webpack devServer配置，默认9000端口
    theme: path.join(srcDir, 'themes/default.js'), // 自定义主题
    useHash: true, // 是否使用hash生成文件
    alias: { // 自定义alias
    $commons: path.join(srcDir, './commons')
    },
    disableCssModulesDirs: [ // 开启css modules可能第三方不支持css modules可以通过这个配置不使用css的modules组件
        path.join(nodeModulesDir, 'antd')
    ],
*/

module.exports = {
    otherPlugins: [], // 增加自定义插件
    rootDir: path.resolve(__dirname), // 项目根路径
    nodeModulesDir: nodeModulesDir, // 项目node模块安装目录
    includeDirs: [srcDir, path.join(nodeModulesDir, 'antd'), path.join(nodeModulesDir, '@piaozone.com')], // 需要loader处理的目录
    srcDir: srcDir, // 前端源码需要webpack处理的目录
    distDir: distDir, // 打包后输出的目录
    useCache: true, // 是否开启缓存
    disableStylelint: false, // 是否禁用stylelint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableEslint: false, // 是否禁用eslint, 建议false，一些旧项目旧代码无法快速修改好才开启
    disableCssModules: true, // 使用禁用css模块
    cacheGroupsVendor: /(react|react-dom|dva|dva-loading|moment)/, //optimization.splitChunks.cacheGroups中vender和libs的匹配规则
    cacheGroupsLibs: /(antd|history)/,
    entry: { // webpack打包入口, 注意每个入口包含自己模板文件index.html，如下与index.js同级
        index: path.join(srcDir, 'index.js')
    }
};

```

## eslint校验规则

```js

// 规则继承 "eslint-config-standard", "eslint-config-standard-jsx", "eslint-config-standard-react"
// 自定义规则
{
    "max-len": [2, 160], // 每行最长160字符，包括前后空格
    "no-trailing-spaces": 0, // 允许换行有多余空格
    "eqeqeq": 0, // 不严格使用全等
    "camelcase": 0, // 变量名不强制使用驼峰
    "indent": [2, 4], // indent Tab大小
    "spaced-comment": 0, // 注释的开头不强制空格
    "semi": ["error", "always"], //结束必须使用分号
    "no-multiple-empty-lines": 0, //允许连续空行
    "space-before-function-paren": ["error", "never"], //function前面的空格
    "eol-last": 0, //行末尾不强制必须有空行
    "no-invalid-regexp": 2,                   //无效的正则
    "no-redeclare": 2,   //禁止重复的定义变量
    "no-func-assign": 2, //禁止重复的函数声明
    "no-restricted-globals": 0,
    "no-dupe-args": 2, //函数参数不能重复
    "no-duplicate-case": 2, //switch中的case标签不能重复
    "no-dupe-keys": 2, //在创建对象字面量时不允许键重复
    "no-const-assign": 2, //禁止修改const声明的变量
    "react/jsx-boolean-value": 0, // 当属性值等于true的时候，不省略该属性的赋值
    "react/jsx-no-duplicate-props": 2, //防止在JSX中重复的props
    "react/no-danger": 2, //防止使用危险的JSX属性
    "react/jsx-uses-react": 2, // 防止react被错误地标记为未使用
    "react/jsx-uses-vars": 2, // 防止在JSX中使用的变量被错误地标记为未使用
    "react/react-in-jsx-scope": 2, // 使用JSX时防止丢失React
    "react/jsx-handler-names": 0, // jsx func名称必要去以handler开始
    "react/jsx-indent": [2, 4], //jsx indent Tab大小
    "react/jsx-indent-props": [2, 4], //jsx props indent Tab大小
    "react/no-direct-mutation-state": 2, // 不允许直接修改state, 只能通过setState修改
    "comma-dangle": 2 //不允许添加对象最后一个逗号，防止导致部分浏览器报错
}

```

## stylelint校验规则

```js

// 规则继承 stylelint-config-standard，stylelint-config-recommended
// 参考地址: https://github.com/stylelint/stylelint-config-standard/blob/HEAD/index.js

// 自定义规则
{
    "selector-pseudo-class-no-unknown": null, // stylint不认global, 需要屏蔽这个规则
    "declaration-block-trailing-semicolon": null, // 要求或不允许在声明块后面的分号
    "color-no-invalid-hex": true, //  禁止无效的十六进制
    "string-no-newline": true, // 禁止在字符串(转义)换行
    "unit-no-unknown": true, // 禁止未知的单位
    "property-no-unknown": true, // 不允许未知属性
    "comment-no-empty": true, // 不允许空的注释
    "block-no-empty": true,  // 不允许空块
    "string-quotes": 'single', //单引号
    "max-empty-lines": 2, // 最大的空行数量
    "function-comma-space-after": 'always',  //在函数的逗号后指定一个空格
    "unit-case": 'lower', // 单位小写
    "block-closing-brace-newline-after": 'always',
    "declaration-colon-space-before": 'never', //冒号之前的声明不需要一个空格
    "declaration-colon-space-after": 'always', //冒号之前的声明需要一个空格
    "block-closing-brace-empty-line-before": 'never', //关闭括号前不允许空一行
    "block-opening-brace-space-before": 'always', //开括号的块之前需要一个空格或不允许空白
    "indentation": 4, //4个空格作为缩进，vscode可以设置tab的大小，并在自动转换为空格
    "font-family-no-missing-generic-family-keyword": null // 禁止在字体系列名称列表中缺少通用族
}

```


## jest config

```js
    // 默认已经配置好，直接pwy-jest即可运行，如果需要覆盖下面参数可以自定义
    // disabledJsxCoverageThreshold: false, // 不计算jsx的覆盖率， lib类型的项目自动忽略
    module.exports = {
        collectCoverageFrom: [ // 需要测试哪些文件
            "<rootDir>/src/**/*.js",
            "<rootDir>/src/**/*.jsx"
        ],
        coveragePathIgnorePatterns: [ // 忽略哪些文件
            "/dist/",
            "/config/",
            "/mock/",
            "/uploadDir/",
            "/run/",
            "/logs/",
            "/node_modules/",
            "/test/"
        ]
    }
```
## License

MIT
