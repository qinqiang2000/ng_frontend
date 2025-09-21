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
			"version": "16.0"
		}
	},
	"parser": "babel-eslint",    
    "parserOptions": {
        // "ecmaFeatures": {
        //     "jsx": true
        // },
        "ecmaVersion": 6,
        "sourceType": "module"
    },	
    "plugins": [
        
    ],
    "extends": [],
    "rules": {    	
		"no-invalid-regexp": 2,                   //无效的正则
//		"no-unexpected-multiline": 2,             //行尾缺少分号可能导致一些意外情况
//		
//      "indent": [1, "tab"], //缩进使用tab
//      "linebreak-style": [ "warning", "windows" ], //换行使用windows换行
//      "quotes": [ "error", "single" ], //字符串使用单引号
//      "semi": ["error", "always"], //末尾不能省略分号
		"no-redeclare": 2,   //禁止重复的定义变量
 	    "no-func-assign": 2, //禁止重复的函数声明
//	  	"no-undef": 2, //不能有未定义的变量
//	  	"no-use-before-define": 2, //未定义前不能使用
        "no-restricted-globals": 0,
    	"no-dupe-args": 2, //函数参数不能重复
    	"no-duplicate-case": 2, //switch中的case标签不能重复
    	"no-dupe-keys": 2, //在创建对象字面量时不允许键重复
    	"no-const-assign": 2, //禁止修改const声明的变量    	
//		"no-alert": 1,//警告使用alert confirm prompt
//		"no-unused-vars": [2, {"vars": "local", "args": "after-used"}],//不能有声明后未被使用的变量或参数		
//		"valid-typeof": 2,//必须使用合法的typeof的值
//		"eqeqeq": 1,//建议使用全等
//		"no-trailing-spaces": 2,//一行结束后面不要有空格
//		"jsx-quotes": [2, "prefer-double"], //强制在JSX属性（jsx-quotes）中一致使用双引号
//		"semi-spacing": [2, {"before": false, "after": true}],//分号前后空格
//		"key-spacing": [2, { "beforeColon": false, "afterColon": true }],//对象字面量中冒号的前后空格
//		"comma-dangle": [2, "never"],//对象字面量项尾不能有逗号
//		"comma-spacing": ["error", { "before": false, "after": true }],//逗号前后的空格
//		"comma-style": [2, "last"],//逗号风格，换行时在行首还是行尾
//		"curly": [2, "all"],//必须使用 if(){} 中的{}
//		"react/jsx-indent-props": [1, "tab"], //验证JSX中的props缩进
		// "react/jsx-no-duplicate-props": 2, //防止在JSX中重复的props
    	// "react/no-danger": 2, //防止使用危险的JSX属性		
		// "react/jsx-uses-react": 2,
		// "react/jsx-uses-vars": 2,
		// "react/react-in-jsx-scope": 2
    }
}