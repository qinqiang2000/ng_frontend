const path = require('path');

module.exports = function(nodeModulesDir, buildConfig={}) {
    const {
        alias ={},
        isLocal
    } = buildConfig;
    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
	const pwyBabel6 = path.resolve(pwyWebpackNodeDir, '@piaozone.com/pwy-babel6/src/node_modules');
    const myModuels = ['node_modules', nodeModulesDir, path.resolve(__dirname, '../node_modules'), pwyBabel6];
    return {
        resolve: {
            modules: myModuels,
            mainFields: ['main'],
            alias: {
                '@babel/polyfill': path.join(__dirname, '../node_modules/@babel/polyfill'),
                react: path.join(nodeModulesDir, isLocal ? 'react/umd/react.development.js' : 'react/umd/react.production.min.js'),
                'react-dom': path.join(nodeModulesDir, isLocal ? 'react-dom/umd/react-dom.development.js' : 'react-dom/umd/react-dom.production.min.js'),
                ...alias // 支持自定义alias
            },
            extensions: ['.js', '.jsx', '.json', '.ts', '.less', '.css']
        },
        resolveLoader: {
            alias: {
                'css-loader': path.resolve(__dirname, '../node_modules/css-loader'),
                'postcss-loader': path.resolve(__dirname, '../node_modules/postcss-loader'),
                'style-loader': path.resolve(__dirname, '../node_modules/style-loader'),
                'less-loader': path.resolve(__dirname, '../node_modules/less-loader'),
                'file-loader': path.resolve(__dirname, '../node_modules/file-loader'),
                'url-loader': path.resolve(__dirname, '../node_modules/url-loader'),
                'eslint-loader': path.resolve(__dirname, '../node_modules/eslint-loader'),
                'babel-loader': path.resolve(__dirname, '../node_modules/babel-loader')
            }
        }
    };
};