module.exports = {
    // https://github.com/stylelint/stylelint-config-standard/blob/HEAD/index.js 内部集成stylelint-config-recommended 对所有错误进行检测处理
    "extends": "stylelint-config-standard",
    "configBasedir": "../src",
    "rules": {
        "no-descending-specificity": null, //  禁止特异性较低的选择器在特异性较高的选择器之后重写
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
}