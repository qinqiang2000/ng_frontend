module.exports = {
    "root": true,
    "globals": {
        "__webpack_public_path__": true,
        "document": true,
        "navigator": true,
        "window": true,
        "location": true
    },
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
	"settings": {
		"react": {
			"version": "16.12.0"
        },
        "import/extensions": [
            ".js",
            ".jsx"
        ]
	},
	"parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "plugins": ["react"],
    "extends": ["standard", "standard-react", "standard-jsx"], //具体扩展规则可以查看node安装目录对应的json文件
    "rules": {
        "no-async-promise-executor": 1,
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
        "comma-dangle": 2, //不允许添加对象最后一个逗号，防止导致部分浏览器报错
        "no-return-await": 0,
        "react/no-deprecated": 0
    }
}