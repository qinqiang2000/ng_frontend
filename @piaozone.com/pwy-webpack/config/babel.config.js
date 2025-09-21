/* eslint-disable */
const path = require('path');
module.exports = {
    'presets': [
        [
            '@babel/preset-env',
            {
                'useBuiltIns': 'entry',
                corejs: 2
            }
        ],
        '@babel/preset-react'
    ],
    'plugins': [
        // ['react-hot-loader/babel'],
        // ["@babel/plugin-transform-runtime"],
        // ["@babel/runtime"],
        ["dynamic-import-webpack"], // 支持动态导入模块
        ['@babel/plugin-proposal-optional-chaining'],
        ['@babel/plugin-proposal-nullish-coalescing-operator'],
        ['@babel/plugin-proposal-class-properties', { 'legacy': true }],
        ['@babel/plugin-proposal-decorators', { 'legacy': true }],
        [
            'import',
            {
                'libraryName': 'antd',
                'libraryDirectory': 'es',
                'style': true,
                'javascriptEnabled': true
            },
            'antd'
        ],
        [
            'import',
            {
                'libraryName': 'antd-mobile',
                'libraryDirectory': 'es',
                'style': true,
                'javascriptEnabled': true
            },
            'antd-mobile'
        ]
    ],
    'env': {
        'production': {
            'plugins': [
                [
                    'transform-react-remove-prop-types',
                    {
                        'ignoreFilenames': ['node_modules']
                    }
                ],
                [
                    'transform-remove-console',
                    {
                        'exclude': ['error', 'warn']
                    }
                ]
            ]
        }
    }
}