
const net = require('net');
const signals = ['SIGINT', 'SIGTERM'];

function setupExitSignals(serverData) {
  signals.forEach((signal) => {
    process.on(signal, () => {
      if (serverData.server) {
        serverData.server.close(() => {
          // eslint-disable-next-line no-process-exit
          process.exit();
        });
      } else {
        // eslint-disable-next-line no-process-exit
        process.exit();
      }
    });
  });
}

function devServer(wpConfigs, buildConfig, argv){
    const devServerStat = {        
        errorDetails: true,
        logging: 'warn',
        colors: true,
        assets: true,
        children: false,
        modules: false		
    };

    let devServerOptions = buildConfig.devServer || {        
        hot: true,
        port: 9000,
        contentBase: './dist'
        //proxy: proxyInfo
    };
	
	let hot = devServerOptions.hot;
	if (typeof hot === 'undefined') {
		hot = true;
	}
	let disableHostCheck = devServerOptions.disableHostCheck;
	if (typeof disableHostCheck === 'undefined') {
		disableHostCheck = true;
	}
	
	const port = devServerOptions.port || 9000;
	
    devServerOptions = {
        ...devServerOptions,
        stats: devServerStat,
		compress: false,
		host: '0.0.0.0',
		port,
        publicPath: 'http://localhost:' + port +'/',
		headers: devServerOptions.headers || {
            'Access-Control-Allow-Origin': '*', 
        },
		open: !!devServerOptions.open,
		hot,
		disableHostCheck, //不检查主机的应用程序容易受到DNS重新绑定攻击,开发环境忽略
        overlay: { // 让错误直接显示到浏览器
            warnings: false,
            errors: true
        }
    };

    const serverData = {
        server: null,
    };

    setupExitSignals(serverData);

    const webpack = require('webpack');
    let compiler;
    let devServer;

    const Server = require('webpack-dev-server');
    try {
        compiler = webpack(wpConfigs);
    } catch (err) {
        if (err.name === 'WebpackOptionsValidationError') {
            if (argv.color) console.error(`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`);
            else console.error(err.message);
            // eslint-disable-next-line no-process-exit
            process.exit(1);
        }
        throw err;
    }

    try {
        devServer = new Server(compiler, devServerOptions);
        // serverData.server = server;
      } catch (err) {
        if (err.name === 'ValidationError') {
        //   console.error(colors.error(devServer.stats.colors, err.message));
          // eslint-disable-next-line no-process-exit
          process.exit(1);
        }
        throw err;
    }

    if(devServerOptions.sockect) {
        const { sockect, host } = devServerOptions;
        devServer.listeningApp.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                const clientSocket = new net.Socket();
                clientSocket.on('error', (err) => {
                    if (err.code === 'ECONNREFUSED') {
                    // No other server listening on this socket so it can be safely removed
                        fs.unlinkSync(socket);      
                        devServer.listen(socket, host, (error) => {
                            if (error) {
                                throw error;
                            }
                        });
                    }
                });
                clientSocket.connect({ path: socket }, () => {
                    throw new Error('This socket is already used');
                });
            }
        });
      
        devServer.listen(socket, host, (err) => {
            if (err) {
                throw err;
            }
            // chmod 666 (rw rw rw)
            const READ_WRITE = 438;      
            fs.chmod(socket, READ_WRITE, (err) => {
                if (err) {
                    throw err;
                }
            });
        });
    } else {
        devServer.listen(devServerOptions.port, devServerOptions.host, (err) => {
            if (err) {
                throw err;
            }
        });
    }
	return compiler;
}

module.exports = devServer;
