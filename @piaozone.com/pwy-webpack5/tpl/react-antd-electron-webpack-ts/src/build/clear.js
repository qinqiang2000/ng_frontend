const _path = require('path');
const fs = require('fs');
const { clearTarget } = require('./syncFiles');

clearTarget(_path.join(__dirname, '../../out'));