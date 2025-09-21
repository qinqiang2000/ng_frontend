const path = require('path');
const commonRules = require('./commonEslintRules');
const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
module.exports = {
    root: true,
    parser: require.resolve(path.join(pwyWebpackNodeDir, '@typescript-eslint/parser')),
    plugins: ['@typescript-eslint/eslint-plugin'],
    env: {
        browser: false,
        commonjs: true,
        es6: true,
        jest: true,
        node: true
    },
    parserOptions: {
        requireConfigFile: false
    },
    overrides: [{
        files: ['**/*.ts?(x)'],
        // If adding a typescript-eslint version of an existing ESLint rule,
        // make sure to disable the ESLint rule here.
        rules: {
            // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
            'default-case': 'off',
            // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
            'no-dupe-class-members': 'off',
            // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
            'no-undef': 'off',

            // Add TypeScript specific rules (and turn off ESLint equivalents)
            '@typescript-eslint/consistent-type-assertions': 'warn',
            'no-array-constructor': 'off',
            '@typescript-eslint/no-array-constructor': 'warn',
            'no-redeclare': 'off',
            '@typescript-eslint/no-redeclare': 'warn',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': [
                'warn',
                {
                    functions: false,
                    classes: false,
                    variables: false,
                    typedefs: false,
                },
            ],
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    args: 'none',
                    ignoreRestSiblings: true,
                }
            ],
            'no-useless-constructor': 'off',
            '@typescript-eslint/no-useless-constructor': 'warn'
        }
    }],
    rules: commonRules
};