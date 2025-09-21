/* eslint-disable */
const getJsxRuntime = require('./getJsxRuntime');
const path = require('path');
const fs = require('fs');

module.exports = ({ isEnvDevelopment, shouldUseReactRefresh, disableJsxRuntime, pwyWebpackNodeDir, nodeModulesDir }) => {
    const hasJsxRuntime = getJsxRuntime(disableJsxRuntime);
    const admPath = path.join(nodeModulesDir, 'antd-mobile/package.json');
    let antdMobileVersion = 5;
    if (fs.existsSync(admPath)) {
        const antdMobileJson = require(admPath);
	    antdMobileVersion = antdMobileJson.version.split('.')[0];
    }

    return {
        customize: require.resolve(
            path.join(pwyWebpackNodeDir, 'babel-preset-react-app/webpack-overrides')
        ),
        presets: [
            [
                require.resolve(path.join(pwyWebpackNodeDir, 'babel-preset-react-app')),
                {
                    runtime: hasJsxRuntime ? 'automatic' : 'classic',
                }
            ]
        ],
        plugins: [
            isEnvDevelopment &&
            shouldUseReactRefresh &&
            require.resolve(path.join(pwyWebpackNodeDir, 'react-refresh/babel'))
        ].filter(Boolean).concat([
            [
                require.resolve(path.join(pwyWebpackNodeDir, 'babel-plugin-import')),
                {
                    'libraryName': 'antd',
                    'libraryDirectory': 'es',
                    'style': true,
                    'javascriptEnabled': true
                },
                'antd'
            ],
            antdMobileVersion >= 5 ? [
                require.resolve(path.join(pwyWebpackNodeDir, 'babel-plugin-import')),
                {
                    'libraryName': 'antd-mobile',
                    'libraryDirectory': 'es/components',
                    'style': false
                },
                'antd-mobile'
            ] : [
				require.resolve(path.join(pwyWebpackNodeDir, 'babel-plugin-import')),
                {
                    'libraryName': 'antd-mobile',
                    'libraryDirectory': 'es',
                    'style': true,
                    'javascriptEnabled': true
                },
                'antd-mobile'
			]
        ])
    };
}