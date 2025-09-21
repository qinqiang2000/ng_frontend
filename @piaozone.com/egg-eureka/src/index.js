

const Eureka = require('./eureka');

const eggEureka = {
    instance: null,
    getInstance: (opts) => {
        if (!this.instance) {
            this.instance = new Eureka(opts);
        }
        return this.instance;
    }
}

module.exports = eggEureka;