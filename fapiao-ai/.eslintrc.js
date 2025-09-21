module.exports = {
    extends: 'eslint-config-egg',
    env: {
        node: true,
        es6: true,
        browser: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        // 自定义规则
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'eol-last': 'error',
        'linebreak-style': ['error', 'windows'], // 强制使用 CRLF
        'comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'space-before-function-paren': ['error', 'never'],
        'keyword-spacing': 'error',
        'space-infix-ops': 'error',
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': ['error', { max: 2 }],
        'prefer-const': 'error',
        'no-var': 'error',
        'arrow-spacing': 'error',
        'template-curly-spacing': 'error',
        'max-len': ['warn', { code: 120, ignoreComments: true }],
    },
    globals: {
        // 全局变量
        bootstrap: 'readonly',
        utils: 'readonly',
    },
};