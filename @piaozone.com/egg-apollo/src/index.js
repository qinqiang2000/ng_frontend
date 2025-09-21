

const Apollo = require('./apollo');

const eggAopllo = {
    instance: null,
    getInstance: (app) => {
        if (!this.instance) {
            this.instance = new Apollo(app);
        }
        return this.instance;
    }
}

module.exports = eggAopllo;