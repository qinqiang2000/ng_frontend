module.exports = {
    // 可能的错误
    "no-cond-assign": 2, // 禁止条件表达式出现赋值
    "no-constant-condition": 2, // 禁止在条件中使用常量表达式
    "no-control-regex": 2, //  禁止在正则表达式中使用控制字符
    "comma-dangle": 2, //不允许添加对象最后一个逗号，防止导致部分浏览器报错
    "no-debugger": 2, // 禁用 debugger
    "no-dupe-args": 2, // 禁止 function 定义中出现重名参数
    "no-dupe-keys": 2,
    "no-duplicate-case": 2, //switch中的case标签不能重复
    "no-empty": 2, // 禁止空语句块
    "no-empty-character-class": 2, // 禁止在正则表达式中使用空字符集 (/^abc[]/)
    "no-ex-assign": 2, // 禁止对 catch 子句的参数重新赋值
    "no-extra-boolean-cast": 2, // 禁止不必要的布尔转换
    "no-extra-parens": 0, // 允许不必要的括号可以保证格式代码(a * b) + c
    "no-extra-semi": 2, // 禁止不必要的分号
    "no-func-assign": 2, // 禁止对 function 声明重新赋值
    "no-inner-declarations": [2, "functions"], // 禁止在嵌套的块中出现 function
    "no-invalid-regexp": 2,  //无效的正则
    "no-irregular-whitespace": 2, // [2, { "skipRegExps": true, "skipComments": true }], // 禁止在字符串和注释之外不规则的空白
    "no-negated-in-lhs": 2, // 禁止在 in 表达式中出现否定的左操作数
    "no-obj-calls":2, // 禁止把全局对象 (Math 和 JSON) 作为函数调用 错误：var math = Math();
    "no-prototype-builtins": 0, // 允许直接使用 Object.prototypes 的内置属性
    "no-regex-spaces": 2, // 禁止正则表达式字面量中出现多个空格
    "no-sparse-arrays": 2, // 禁用稀疏数组
    "no-unexpected-multiline": 2, // 禁止出现令人困惑的多行表达式
    "no-unreachable": 2, // 禁止在return、throw、continue 和 break语句之后出现不可达代码
    "use-isnan": 2, // 要求使用 isNaN() 检查 NaN
    "valid-jsdoc": 2, // 使用有效的 JSDoc 注释
    "valid-typeof": 2, // 强制 typeof 表达式与有效的字符串进行比较

    // 最佳实践
    "accessor-pairs": 2, // 定义对象的set存取器属性时，强制定义get
    "array-callback-return": 2, // 强制数组方法的回调函数中有 return 语句
    "block-scoped-var": 2, // 强制把变量的使用限制在其定义的作用域范围内
    "complexity": [2, 30], // 限制圈复杂度，也就是类似if else能连续接多少个
    "consistent-return": 0, // 不强制要求 return 语句要么总是指定返回的值，要么不指定
    "curly": [2, "all"], // 强制所有控制语句使用一致的括号风格
    "default-case": 2, // switch 语句强制 default 分支
    'no-console': ["warn", { allow: ["warn", "error"] }], // 只允许有warn和erro console
    "dot-location": [2, "property"], // property，'.'号应与属性在同一行, object, '.' 号应与对象名在同一行
    "semi": ["error", "always"], //结束必须使用分号
    // 强制使用.号取属性
    // 参数： allowKeywords：true 使用保留字做属性名时，只能使用.方式取属性
    // false 使用保留字做属性名时, 只能使用[]方式取属性 e.g [2, {"allowKeywords": false}]
    // allowPattern: 当属性名匹配提供的正则表达式时，允许使用[]方式取值,否则只能用.号取值 e.g [2, {"allowPattern": "^[a-z]+(_[a-z]+)+$"}]
    "dot-notation": [0, {"allowKeywords": false }],
    "eqeqeq": [2, "allow-null"], // 使用 === 替代 == allow-null允许null和undefined==
    "guard-for-in": 2, // 要求 for-in 循环中有一个 if 语句判断属性是否存在
    "no-alert": 1, // alert警告
    "no-caller": 2, // 禁用 arguments.caller 或 arguments.callee
    // "no-case-declarations": 2, // 不允许在 case 子句中使用词法声明
    "no-div-regex":2, // 禁止除法操作符显式的出现在正则表达式开始的位置
    "no-else-return": 2, // 禁止 if 语句中有 return 之后有 else
    "no-empty-function": 2, // 禁止出现空函数.如果一个函数包含了一条注释，它将不会被认为有问题。
    "no-empty-pattern": 2, // 禁止使用空解构模式no-empty-pattern
    "no-eq-null": 2, // 禁止在没有类型检查操作符的情况下与 null 进行比较
    "no-eval":2, // 禁用 eval()
    "no-extend-native": 2, // 禁止扩展原生类型
    "no-extra-bind": 2, // 禁止不必要的 .bind() 调用
    "no-extra-label": 2, // 禁用不必要的标签
    "no-fallthrough": 2, // 禁止 case 语句落空
    "no-floating-decimal": 2, // 禁止数字字面量中使用前导和末尾小数点
    "no-implicit-coercion": 0, // 禁止使用短符号进行类型转换(!!fOO)
    "no-implicit-globals": 1, // 禁止在全局范围内使用 var 和命名的 function 声明
    "no-implied-eval": 2, // 禁止使用类似 eval() 的方法
    "no-invalid-this": 2, // 禁止 this 关键字出现在类和类对象之外
    "no-iterator":2, //__iterator__已废弃， 禁用 __iterator__ 属性
    "no-labels": 2, // 禁用标签语句
    "no-lone-blocks":2, // 禁用不必要的嵌套块
    "no-loop-func":2, // 禁止在循环中出现 function 声明和表达式
    "no-magic-numbers": 0, // 禁用魔术数字(3.14什么的用常量代替)
    "no-multi-spaces": 2, // 禁止使用多个空格
    "no-multi-str": 2, // 禁止使用多行字符串，在 JavaScript 中，可以在新行之前使用斜线创建多行字符串
    "no-native-reassign": 2, // 禁止对原生对象赋值
    "no-new": 2, // 禁止使用new不将结果对象分配给变量的关键字
    "no-new-func": 0, // 对 Function 对象使用 new 操作符
    "no-new-wrappers": 2, // 禁止对 String，Number 和 Boolean 使用 new 操作符
    "no-octal":2, // 禁用八进制字面量
    "no-octal-escape": 2, //至于 ECMAScript 5 规范，字符串文字中的八进制转义序列已被弃用，不应使用。应该使用 Unicode 转义序列
    "no-param-reassign": 0, // 不允许对 function 的参数进行重新赋值
    "no-proto": 2, // __proto__属性已从 ECMAScript 3.1 中弃用，不应在代码中使用。改为使用方法getPrototypeOf
    "no-redeclare": 2, // 禁止使用 var 多次声明同一变量
    "no-return-assign": 2, // 在return报表中不使用赋值
    "no-script-url": 2, // 禁止使用 javascript: url
    "no-self-assign": 2, // 禁止自我赋值
    "no-self-compare": 2, // 禁止自身比较
    "no-sequences":2, // 禁用逗号操作符
    "no-throw-literal":2, // 禁止抛出非异常字面量，统一Error对象
    "no-unmodified-loop-condition": 2, // 禁用一成不变的循环条件
    "no-unused-expressions": 2, // 禁止出现未使用过的表达式
    "no-unused-labels": 2, // 禁用未使用过的标签
    "no-useless-call": 2, // 禁止不必要的 .call() 和 .apply()
    "no-useless-concat": 2, // 禁止不必要的字符串字面量或模板字面量的连接
    "no-useless-escape": 2, // 禁用不必要的转义字符
    "no-void": 0, // 禁用 void 操作符
    "no-warning-comments":0, // 禁止在注释中使用特定的警告术语
    "no-with": 2, // 禁用 with 语句
    "radix": 0, // 强制在parseInt()使用基数参数
    "vars-on-top": 2, // 要求所有的 var 声明出现在它们所在的作用域顶部
    "wrap-iife": [2,"any"], // 要求 IIFE 使用括号括起来， 如：var x = (function () { return { y: 1 };})(); // wrapped function expression
    "yoda": [2, "never"], // 要求或禁止 “Yoda” 条件
    "strict": 0, // 要求或禁止使用严格模式指令

    // 变量声明
    "init-declarations": 0, // 要求或禁止 var 声明中的初始化(初值)
    "no-catch-shadow": 0, // 不允许 catch 子句的参数与外层作用域中的变量同名, 需要支持IE 8及更早版本则需要禁止
    "no-delete-var": 2, // 禁止删除变量
    "no-label-var": 2, // 不允许标签与变量同名
    "no-restricted-globals": 0, // 禁用特定的全局变量
    "no-shadow": 2, // 禁止 var 声明 与外层作用域的变量同名
    "no-shadow-restricted-names": 2, // 禁止覆盖受限制的标识符
    "no-undef": 2, // 禁用未声明的变量，除非它们在 /*global */ 注释中被提到
    "no-undef-init": 2, // 禁止将变量初始化为 undefined
    "no-undefined": 0, // 禁止将 undefined 作为标识符
    "no-unused-vars": [2, {"vars":"all","args":"none", "ignoreRestSiblings": true }], // 禁止出现未使用过的变量
    "no-use-before-define": 2, // 不允许在变量定义之前使用它们

    // Node.js and CommonJS
    "callback-return": 0, // require return statements after callbacks
    "global-require": 1, // 要求 require() 出现在顶层模块作用域中
    "handle-callback-err": [2,"^(err|error)$"], // 要求回调函数中有容错处理
    "no-mixed-requires": 2, // 禁止混合常规 var 声明和 require 调用
    "no-new-require": 2, // 禁止调用 require 时使用 new 操作符
    "no-path-concat": 0, // 禁止对 __dirname 和 __filename进行字符串连接
    "no-process-env": 0, // 禁用 process.env
    "no-process-exit": 0, // 禁用 process.exit()
    "no-sync": 0, // 禁用同步方法

    // 风格指南
    // 指定数组的元素之间要以空格隔开(, 后面)， never参数：[ 之前和 ] 之后不能带空格，always参数：[ 之前和 ] 之后必须带空格
    "array-bracket-spacing": [2, "never"],
    "block-spacing": [2, "always"], // 禁止或强制在单行代码块中使用空格(禁用)
    "brace-style": [2, "1tbs", { "allowSingleLine": true }], //强制使用一致的缩进第二个参数为 "tab" 时，会使用tab
    "camelcase": 0, // 双峰驼命名格式
    "comma-spacing": [2, { "before": false, "after": true }], // 控制逗号前后的空格
    "comma-style": [2, "last"], // 控制逗号在行尾出现还是在行首出现 (默认行尾)
    "computed-property-spacing": [2, "never"], // 以方括号取对象属性时，[ 后面和 ] 前面是否需要空格, 可选参数 never, always
    // 用于指统一在回调函数中指向this的变量名，箭头函数中的this已经可以指向外层调用者，应该没卵用了
    // e.g [0,"that"] 指定只能 var that = this. that不能指向其他任何值，this也不能赋值给that以外的其他值
    "consistent-this": [2, "that"],
    "func-names": 2, // 强制使用命名的 function 表达式
    "eol-last": 0, // 文件末尾强制换行
    "indent": [2, 4, { "SwitchCase": 1 }],
    "key-spacing": [2, {"beforeColon": false, "afterColon": true}], // 强制在对象字面量的属性中键和值之间使用一致的间距
    "linebreak-style": [1, "windows"], // 强制使用一致的换行风格
    "lines-around-comment": 0, // 要求在块级注释之前有一空行)
    // 强制一致地使用函数声明或函数表达式，方法定义风格，参数：
    // declaration: 强制使用方法声明的方式，function f(){} e.g [2, "declaration"]
    // expression：强制使用方法表达式的方式，var f = function() {} e.g [2, "expression"]
    // allowArrowFunctions: declaration风格中允许箭头函数。 e.g [2, "declaration", { "allowArrowFunctions": true }]
    "func-style": 0,
    "max-nested-callbacks": [2, 5], // 强制回调函数最大嵌套深度5层
    "id-blacklist": 0, // 禁止使用指定的标识符
    "id-length": 0, // 强制标识符的最新和最大长度
    "id-match": 0, // 要求标识符匹配一个指定的正则表达式
    "jsx-quotes":  ["error", "prefer-single"], // 强制在 JSX 属性中一致地使用双引号
    "keyword-spacing": ["error", { "before": true }], // 强制在关键字前后使用一致的空格 (前需要)
    "max-len": [2, 160], // 每行最长160字符，包括前后空格
    // "max-lines": [2, 500], // 强制最大行数
    "max-params": [1, 7], // 强制 function 定义中最多允许的参数数量
    "max-statements": [1, 200], // 强制 function 块最多允许的的语句数量
    "max-statements-per-line": [2, { "max": 1 }], // 强制每一行中所允许的最大语句数量
    "new-cap": [2, {"newIsCap": true, "capIsNew":false}], // 要求构造函数首字母大写
    "new-parens":2, // 要求调用无参构造函数时有圆括号
    "newline-after-var": 0, // 要求或禁止var声明语句后有一行空行
    "no-array-constructor": 2, // 禁止使用 Array 构造函数
    "no-bitwise": 0, // 禁用按位运算符
    "newline-before-return": 0, // 要求 return 语句之前有一空行
    "newline-per-chained-call": 2, // 要求方法链中每个调用都有一个换行符
    "no-continue": 0, // 禁用 continue 语句
    "no-inline-comments": 0, // 禁止在代码行后使用内联注释
    "no-lonely-if": 2, // 禁止 if 作为唯一的语句出现在 else 语句中
    "no-mixed-operators": 0, // 禁止混合使用不同的操作符
    "no-mixed-spaces-and-tabs": 2, // 不允许空格和 tab 混合缩进
    "no-multiple-empty-lines": [2, {"max": 2}], // 不允许多个空行
    "no-negated-condition": 0, // 不允许否定的表达式
    "no-nested-ternary": 0, // 不允许使用嵌套的三元表达式
    "no-new-object": 2, // 禁止使用 Object 的构造函数
    "no-plusplus": 0, // 禁止使用一元操作符 ++ 和 --
    "no-restricted-syntax":0, // 禁止使用特定的语法
    "func-call-spacing": ["error", "never"], // 不允许在函数名称和左括号之间留出空格
    "no-ternary": 0, // 不允许使用三元操作符
    "no-trailing-spaces": 2, // 禁用行尾空格
    "no-underscore-dangle": 0, // 禁止标识符中有悬空下划线_bar
    "no-unneeded-ternary": 2, // 禁止可以在有更简单的可替代的表达式时使用三元操作符
    "no-whitespace-before-property": 2, // 禁止属性前有空白
    "object-curly-newline": 0, // 强制花括号内换行符的一致性
    "object-curly-spacing": ["error", "always"], // 强制在花括号中使用一致的空格
    "object-property-newline": 0, // 强制将对象的属性放在不同的行上
    "one-var": [2, { "initialized":"never" }], // 强制函数中的变量要么一起声明要么分开声明
    "one-var-declaration-per-line": 0, // 要求或禁止在 var 声明周围换行
    "operator-assignment": 0, // 要求或禁止在可能的情况下要求使用简化的赋值操作符
    "operator-linebreak": [2, "after", { "overrides": { "?":"before",":": "before" } }], // 强制操作符使用一致的换行符
    "padded-blocks": 0, // 要求或禁止块内填充
    "quote-props": 0, // 要求对象字面量属性名称用引号括起来
    "quotes": [2, "single", { "avoidEscape": true }], // 强制使用一致的反勾号、双引号或单引号
    "require-jsdoc": 0, // 要求使用 JSDoc 注释
    "semi": [2, "always"], // 要求或禁止使用分号而不是ASI（这个才是控制行尾部分号的，）
    "semi-spacing": 2, // 强制分号之前和之后使用一致的空格
    "sort-vars": 0, // 要求同一个声明块中的变量按顺序排列
    "space-before-blocks": [2, "always"], // 强制在块之前使用一致的空格
    "space-before-function-paren": [2,"never"], // 强制在 function的左括号之前使用一致的空格
    "space-in-parens": [2, "never"], // 强制在圆括号内使用一致的空格
    "space-infix-ops": 2, // 要求操作符周围有空格
    "space-unary-ops": [2, {"words":true, "nonwords":false}], // 强制在一元操作符前后使用一致的空格
    "spaced-comment": ["error", "always"], // 强制在注释中 // 或 /* 使用一致的空格
    "unicode-bom": 0, // 要求或禁止 Unicode BOM
    "wrap-regex": 0, // 要求正则表达式被括号括起来
    "newline-per-chained-call": 0,

    //////////////
    // ES6.相关 //
    //////////////

    // 要求箭头函数体使用大括号
    "arrow-body-style": 0,
    // 要求箭头函数的参数使用圆括号
    "arrow-parens": 2,
    // 箭头之前/之后标准化间距
    "arrow-spacing": [2, { "before":true, "after":true }],
    // 强制在子类构造函数中用super()调用父类构造函数，TypeScrip的编译器也会提示
    "constructor-super": 2,
    // 强制 generator 函数中 * 号周围使用一致的空格
    "generator-star-spacing": [2, { "before":true, "after": false}],
    // 禁止修改类声明的变量
    "no-class-assign":2,
    // 不允许箭头功能，在那里他们可以混淆的比较
    "no-confusing-arrow": 0,
    // 禁止修改 const 声明的变量
    "no-const-assign": 2,
    // 禁止类成员中出现重复的名称
    "no-dupe-class-members":2,
    // 此规则要求从单个模块进行的所有导入都以单一import语句存在。
    "no-duplicate-imports": 2,
    // 防止Symbol与new操作员的意外
    "no-new-symbol": 2,
    // 允许指定模块加载时的接口
    "no-restricted-imports": 0,
    // 禁止在extends class构造函数在调用 super() 之前使用 this 或 super
    "no-this-before-super": 2,
    // 禁止不必要的计算性能键对象的文字
    "no-useless-computed-key": 2,
    // 要求使用 let 或 const 而不是 var
    "no-var": 2,
    // 要求或禁止对象字面量中方法和属性使用简写语法
    "object-shorthand": 0,
    // 要求使用箭头函数作为回调
    "prefer-arrow-callback": 2,
    // 要求使用 const 声明那些声明后不再被修改的变量
    "prefer-const": ["error", {"destructuring": "all"}],
    // 要求在合适的地方使用 Reflect 方法， Reflect.apply(myFunction, undefined, args);
    "prefer-reflect": 1,
    // 要求使用扩展运算符而非 .apply()
    "prefer-spread": 0,
    // 要求使用模板字面量而非字符串连接
    "prefer-template": 0,
    /* Suggest using the rest parameters instead of arguments
    function foo(...args) {
        console.log(args);
    }
    */
    "prefer-rest-params": 2,
    // 要求generator 函数内有 yield
    "require-yield": 0,
    // fn(... args)  => fn(...args)
    "rest-spread-spacing": ["error", "never"],
    // 强制模块内的 import 排序
    "sort-imports": 0,
    // 要求或禁止模板字符串中的嵌入表达式周围空格的使用
    "template-curly-spacing": 2,
    // 强制在yield周围使用空格 yield *
    "yield-star-spacing": ["error", "before"],
    // disallow async Promise executor functions.
    "no-async-promise-executor": 2,
    // 允许直接return await
    "no-return-await": 0
}