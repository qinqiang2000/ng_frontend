var path = require('path');
var fs = require('fs');

function copyTheBuildFile(){
    var filename = 'swjgFpdk.js';
    var filePath = path.resolve('./build/swjgFpdk.js');
    var targetDir = path.resolve('E:\\workspace-portalweb-new\\qianduan2018-07-16\\static\\gov-fpcy\\js\\');
    var targetFilename = path.join(targetDir, filename);
    var data = fs.readFileSync(filePath, 'utf8');
    if(data){
        fs.writeFile(targetFilename, data, function(err){
            if(err){
                console.log(filename + " 复制失败");
                throw err                    
            }else{
                console.log(filename + " 复制成功");
            }
        });
    }else{
        console.warning('复制失败，文件为空');;
    }    
}

copyTheBuildFile();