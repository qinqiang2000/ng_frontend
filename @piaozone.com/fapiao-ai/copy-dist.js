
const path = require('path');
const fs = require('fs');
const targetDir = 'D:/bhb/workspace/qianduan-git/fapiao-ai/app/public';
const distDir = path.join(__dirname, './dist');
const bxdCnDir = path.join(distDir, 'bxd-cn');
const bxdEnDir = path.join(distDir, 'bxd-en');
const bxdAlbDir = path.join(distDir, 'bxd-alb');

const copyDirNames = ['bxd-cn', 'bxd-en', 'bxd-alb', 'fapiao-ai'];

function emptyDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        fs.unlinkSync(path.join(dir, file));
    }
}

function copyDir(srcDir, targetDir) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
        fs.copyFileSync(path.join(srcDir, file), path.join(targetDir, file));
    }
}

for (const dirName of copyDirNames) {
    if (!fs.existsSync(path.join(targetDir, dirName))) {
        fs.mkdirSync(path.join(targetDir, dirName));
    } else {
        emptyDir(path.join(targetDir, dirName));
    }
}

for (const dirName of copyDirNames) {
    copyDir(path.join(distDir, dirName), path.join(targetDir, dirName));
}