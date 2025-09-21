const CkScanFile = require('./ckScanfile');
const scanFilesV2 = require('./scanFile');

module.exports = {
    scanFilesOld: CkScanFile.default,
    scanFiles: scanFilesV2.default
};
