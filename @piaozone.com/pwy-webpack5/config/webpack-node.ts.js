'use strict';
var path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const resolve = require('resolve');
const ESLintPlugin = require('eslint-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { checkUseTypeScript } = require('../lib/tools');
const createEnvironmentHash = require('../lib/createEnvironmentHash');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (buildConfig = {}, argv = {} ) => {
    const {
		fixEslint,
		srcDir,
        rootDir,
        distDir,
        entry,
        alias,
        disableEslint,
		shouldUseSourceMap,
        nodeModulesDir,
        imageInlineSizeLimit = 10000,
		otherPlugins = [],
		envVariables = {}
    } = buildConfig;
	let useCache = false;
	const newEntrys = {};
    const entryKeys = Object.keys(entry);
    const pwyWebpackNodeDir = path.join(__dirname, '../node_modules');
    const resolveExtensions = [
        '.web.mjs',
        '.mjs',
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json'
    ];

    const nodeEslintRules = require('./nodeEslintRules');
	const nodeEnv = argv.nodeEnv;

    let isEnvProduction = true;
    let isEnvDevelopment = false;

	if (nodeEnv === 'development') {
		useCache = true;
		isEnvProduction = false;
		isEnvDevelopment = true;
	} else if (nodeEnv === 'production'){
		useCache = false;
		isEnvProduction = true;
		isEnvDevelopment = false;
	}

    let devtool = shouldUseSourceMap ? 'source-map' : false;
    let mode = isEnvDevelopment ? 'development' : 'production';
	const pwyEnv = argv.pwyEnv;
    if (argv.devtool) {
        mode = 'development';
        devtool = argv.devtool;
        isEnvProduction = false;
        isEnvDevelopment = true;
    }

    const tsCheckInfo = checkUseTypeScript(buildConfig.rootDir, buildConfig.tsConfig);
    const useTypeScript = tsCheckInfo.useTypeScript;
    const tsConfigList = tsCheckInfo.tsConfigList;
    const tsConfig = tsCheckInfo.tsConfig;
	const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');
	let optimization = {
		minimize: isEnvProduction,
		minimizer: [
			// production mode 才会生效
			new TerserPlugin({
				terserOptions: {
					parse: {
						ecma: 8,
					},
					compress: {
						ecma: 5,
						warnings: false,
						comparisons: false,
						inline: 2,
					},
					mangle: {
						safari10: true,
					},
					keep_classnames: isEnvProductionProfile,
					keep_fnames: isEnvProductionProfile,
					output: {
						ecma: 5,
						comments: false,
						ascii_only: true,
					},
				},
			}),
		]
	};

	for (let i = 0; i < entryKeys.length; i++) {
        const k = entryKeys[i];
        newEntrys[k] = entry[k];
        newEntrys[k + '.min'] = entry[k];
    }

	const output = {
		path: distDir,
		filename: '[name].js'
	};

	if (buildConfig.library) {
		output.library = buildConfig.library || 'umd';
		output.libraryTarget = buildConfig.libraryTarget || 'exports';
		if (buildConfig.libraryExport === 'default') {
			output.libraryExport = 'default';
		}
		optimization = {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					include: /\.min\.(js|css)$/
				})
			]
		};
		// optimization.minimizer.push(new OptimizeCssAssetsPlugin());
	}

    return {
        mode,
        entry: newEntrys,
        target: 'node',
        output: output,
		devtool,
		/*
        node: {
            __dirname: false,
			__filename: false
        },
		*/
        resolve: {
            modules: ['node_modules', nodeModulesDir, path.resolve(__dirname, '../node_modules')],
            extensions: resolveExtensions,
            alias: alias,
			plugins: [new TsconfigPathsPlugin({ configFile: tsConfig })]
        },
        resolveLoader: {
            alias: {
                'css-loader': path.resolve(pwyWebpackNodeDir, 'css-loader'),
                'postcss-loader': path.resolve(pwyWebpackNodeDir, 'postcss-loader'),
                'style-loader': path.resolve(pwyWebpackNodeDir, 'style-loader'),
                'less-loader': path.resolve(pwyWebpackNodeDir, 'less-loader'),
                'file-loader': path.resolve(pwyWebpackNodeDir, 'file-loader'),
                'url-loader': path.resolve(pwyWebpackNodeDir, 'url-loader'),
                'eslint-loader': path.resolve(pwyWebpackNodeDir, 'eslint-loader'),
                'ts-loader': path.resolve(pwyWebpackNodeDir, 'ts-loader')
            }
        },
        cache: {
            type: 'filesystem',
            version: createEnvironmentHash('/'),
            cacheDirectory: path.resolve(nodeModulesDir, '.cache'),
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: tsConfigList
            }
        },
		externalsPresets: { node: true },
		externals: [nodeExternals()],
        module: {
            // strictExportPresence: true,
            rules: [{
	　　　　　　test: /\.tsx?$/,
	　　　　　　// ts-loader是官方提供的处理tsx的文件
				use: [
				  {
					loader: require.resolve('ts-loader'),
					options: {
						transpileOnly: true,
						configFile: tsConfig
					}
				  }
				],
	　　　　　　exclude: /node_modules/
	　　　　}]
        },
        optimization: optimization,
        plugins: [
            new webpack.DefinePlugin({
				'process.env': JSON.stringify({
					...envVariables,
					PWY_ENV: pwyEnv
				})
			}),
            !disableEslint &&
            new ESLintPlugin({
                // Plugin options
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                // formatter: require.resolve(path.join(pwyWebpackNodeDir, 'react-dev-utils/eslintFormatter')),
                eslintPath: require.resolve(path.join(pwyWebpackNodeDir, 'eslint')),
                exclude: ['node_modules'],
                files: srcDir,
                context: srcDir,
                cache: useCache,
                cacheLocation: path.resolve(
                    nodeModulesDir,
                    '.cache/.eslintcache'
                ),
                fix: fixEslint,
                threads: false, // Boolean | Number 以线程池方式运行 lint 。线程池大小是自动的
                failOnError: true,
                emitError: true,
                emitWarning: true,
                // ESLint class options
                cwd: srcDir,
                resolvePluginsRelativeTo: path.join(pwyWebpackNodeDir, '../'),
                useEslintrc: false,
                baseConfig: nodeEslintRules,
            })
        ].filter(Boolean).concat(otherPlugins),
        performance: false
    };
}

