module.exports = app => {
    app.messenger.on('compile_action', data => {
        if (data.compilerIsFinish) {
            console.log('webpack build success!');
        }
    });
};