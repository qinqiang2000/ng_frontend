
const path = require('path');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
module.exports = function getOutput(isLocal, buildConfig) {
    const {
        distDir,
        srcDir,
        homepage,
        PUBLIC_URL
    } = buildConfig;

    const isEnvProduction = !isLocal;
    const isEnvDevelopment = isLocal;

    const publicUrlOrPath = getPublicUrlOrPath(
        isLocal,
        homepage,
        PUBLIC_URL
    );

    const output = {
        // The build folder.
        path: distDir,
        pathinfo: isEnvDevelopment,
        filename: isEnvProduction
          ? 'static/js/[name].[contenthash:8].js'
          : isEnvDevelopment && 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: isEnvProduction
          ? 'static/js/[name].[contenthash:8].chunk.js'
          : isEnvDevelopment && 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
        // webpack uses `publicPath` to determine where the app is being served from.
        // It requires a trailing slash, or the file assets will get an incorrect path.
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: publicUrlOrPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: isEnvProduction
          ? info =>
              path
                .relative(srcDir, info.absoluteResourcePath)
                .replace(/\\/g, '/')
          : isEnvDevelopment &&
            (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
    };
    return output;
}
