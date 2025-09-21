module.exports = {
    // react 相关
    'react/react-in-jsx-scope': 'error',
    "react/jsx-boolean-value": 0, // 当属性值等于true的时候，不省略该属性的赋值
    "react/jsx-no-duplicate-props": 2, //防止在JSX中重复的props
    "react/no-danger": 2, //防止使用危险的JSX属性
    "react/jsx-uses-react": 2, // 防止react被错误地标记为未使用
    "react/jsx-uses-vars": 2, // 防止在JSX中使用的变量被错误地标记为未使用
    "react/jsx-handler-names": 0, // jsx func名称必要去以handler开始
    "react/jsx-indent": [2, 4], //jsx indent Tab大小
    "react/jsx-indent-props": [2, 4], //jsx props indent Tab大小
    "react/no-direct-mutation-state": 2, // 不允许直接修改state, 只能通过setState修改
    "react-hooks/exhaustive-deps": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "jsx-a11y/alt-text": 0
};