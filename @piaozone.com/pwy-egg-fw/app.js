const path = require('path');
const assert = require('assert');
const fs = require('fs');

module.exports = app => {
  app.beforeStart(async () => {
    // 只需要在服务器环境才需要执行
    
    if(app.config.env !== 'local' && app.config.themes){
    	const themes = app.config.themes;
	    const manifests = {};
	    for(let i=0; i<themes.length; i++){
	    	if(themes[i] === 'default'){
	    		const manifestPath = path.join(app.config.baseDir, 'config/manifest.json');
	    		assert(fs.existsSync(manifestPath), `${manifestPath} is required`);
	    		manifests[themes[i]] = require(manifestPath);
	    	}else{
	    		const manifestPath = path.join(app.config.baseDir, 'config/manifest-'+ themes[i] +'.json');
	    		try{
	    			manifests[themes[i]] = require(manifestPath);	
	    		}catch(e){
	    			//TODO handle the exception
	    			console.log('load theme fail: ' + manifestPath);
	    		}
	    		
	    		
	    	}    	
	    }	    
	    
	    app.manifests = manifests;
    }
  });
};