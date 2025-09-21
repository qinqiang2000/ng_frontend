module.exports = {
    'globals': {
        window: true,
        React: true
    },
    'root': true,
    'env': {
        'browser': true,
        'jest': true
    },
    'parser': '@babel/eslint-parser',
    'parserOptions': {
        'ecmaVersion': 10,
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true
        },
        'requireConfigFile': false,
        'babelOptions': {
            'presets': ['@babel/preset-react']
        }
    },
    'extends': ['standard', 'standard-react', 'standard-jsx'],
    'rules': {
        'no-invalid-regexp': 2, // 无效的正则
        'no-unexpected-multiline': 2, // 行尾缺少分号可能导致一些意外情况
        'indent': [2, 4], // 缩进使用4个空格
        'no-multi-spaces': 2, // 禁止出现多个空格
        'no-redeclare': 2, // 禁止重复的定义变量
        'no-func-assign': 2, // 禁止重复的函数声明
        'no-undef': 2, // 不能有未定义的变量
        'no-use-before-define': 2, // 未定义前不能使用
        'no-restricted-globals': 0,
        'no-dupe-args': 2, // 函数参数不能重复
        'no-duplicate-case': 2, // switch中的case标签不能重复
        'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复
        'no-const-assign': 2, // 禁止修改const声明的变量
        'no-alert': 1, // 警告使用alert confirm prompt
        'no-unused-vars': [2, { 'vars': 'local', 'args': 'after-used' }], // 不能有声明后未被使用的变量或参数
        'valid-typeof': 2, // 必须使用合法的typeof的值
        'eqeqeq': 2, // 建议使用全等
        'no-trailing-spaces': 2, // 一行结束后面不要有空格
        'semi-spacing': 2, // 分号前后空格
        'key-spacing': 2, // 对象字面量中冒号的前后空格
        'comma-dangle': [2, 'never'], // 对象字面量项尾不能有逗号
        'comma-spacing': 2, // 逗号前后的空格
        'spaced-comment': 2, // 要求注释必须跟随至少一个空白
        'comma-style': 2, // 逗号风格，换行时在行首还是行尾
        'react/jsx-no-duplicate-props': 2, // 防止在JSX中重复的props
        'react/no-danger': 2, // 防止使用危险的JSX属性
        'react/jsx-uses-react': 2, // 防止react被错误地标记为未使用
        'react/jsx-uses-vars': 2, // 防止在JSX中使用的变量被错误地标记为未使用
        'react/react-in-jsx-scope': 2, // 使用JSX时防止丢失React
        'react/jsx-handler-names': 0, // jsx func名称必要去以handler开始
        'react/jsx-indent': [2, 4], // jsx indent Tab大小
        'react/jsx-indent-props': [2, 4], // jsx props indent Tab大小
        'react/jsx-boolean-value': 0, // 当属性值等于true的时候，不省略该属性的赋值
        'react-hooks/exhaustive-deps': 0, // 禁用useEffect缺少依赖提示
        'semi': [2, 'always'], // 末尾不能省略分号
        'quote-props': 0, // 不要求对象字面量属性名称使用引号
        'camelcase': 0, // 不强制使用骆驼拼写法命名约定
        'multiline-ternary': 0, // 允许三元操作数中间换行
        'space-before-function-paren': [2, 'never'] // 禁止函数圆括号之前有一个空格
    }
};
