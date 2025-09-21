// app/router.js

const routesGroup = require('./routeGroup/');

module.exports = app => {
    for (const item in routesGroup) {
        routesGroup[item](app);
    }
};
