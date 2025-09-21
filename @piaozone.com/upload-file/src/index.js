import { compressImgFile } from '@piaozone.com/process-image';
function uploadBackend(url, formData) {
    return new Promise((resolve) => {
        try {
            // eslint-disable-next-line
            $.ajax({
                type: 'post',
                url: url,
                data: formData,
                contentType: false,
                cache: false,
                processData: false,
                success: (res) => {
                    resolve(res);
                },
                error: (res) => {
                    console.warn('upload fail', res);
                    resolve({
                        errcode: '5000',
                        description: '服务端异常，请稍后再试！'
                    });
                }
            });
        } catch (error) {
            console.error('upload error', error);
            resolve({
                errcode: '5002',
                description: '服务端异常，请稍后再试！'
            });
        }
    });
}


function getUid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export async function upload(url, files, opt = {}) {
    const {
        fileQuality,
        fileLimitWidth,
        fileLimitHeight,
        fileLimitPixel,
        fileLimitSize,
        uploadData = {},
        fieldName = 'file',
        stepUploadFinish = f => f,
        uploadStart = f => f,
        uploadFinish = f => f,
        accept = ''
    } = opt;

    const compressOpt = { fileLimitSize };

    if (fileQuality) {
        compressOpt.fileQuality = fileQuality;
    }

    if (fileLimitWidth) {
        compressOpt.fileLimitWidth = fileLimitWidth;
    }

    if (fileLimitHeight) {
        compressOpt.fileLimitHeight = fileLimitHeight;
    }

    if (fileLimitPixel) {
        compressOpt.fileLimitPixel = fileLimitPixel;
    }

    if (fileLimitSize) {
        compressOpt.fileLimitSize = fileLimitSize;
    }

    const keyNames = Object.keys(uploadData);
    const targetFiles = [];
    for (let i = 0; i < files.length; i++) {
        const curFile = files[i];
        const curUid = 'k' + getUid();
        if (accept === '') {
            targetFiles.push({ file: curFile, uid: curUid });
        } else {
            // accept正则匹配才能上传
            if (accept.test(curFile.name)) {
                targetFiles.push({ file: curFile, uid: curUid });
            } else {
                await stepUploadFinish({ errcode: '40002', description: '不支持的发票类型', file: curFile, localUrl: '', uid: curUid });
            }
        }
    }

    if (targetFiles.length > 0) {
        try {
            await uploadStart(targetFiles);
        } catch (error) {
            console.warn('uploadStart 回调异常', error);
        }
    }


    for (let i = 0; i < targetFiles.length; i++) {
        const curFile = targetFiles[i].file;
        const curUid = targetFiles[i].uid;
        const res = await compressImgFile(curFile, compressOpt);
        if (res.errcode !== '0000') {
            await stepUploadFinish({ ...res, file: curFile, localUrl: res.localUrl || '', uid: curUid });
        } else {
            const file = res.file;
            const localUrl = res.localUrl;
            const formData = new FormData();
            formData.append(fieldName, file);
            for (let j = 0; j < keyNames.length; j++) {
                formData.append(keyNames[j], uploadData[keyNames[j]]);
            }
            const resUpload = await uploadBackend(url, formData);
            await stepUploadFinish({ ...resUpload, file: curFile, localUrl, uid: curUid });
        }
    }
    await uploadFinish();
};