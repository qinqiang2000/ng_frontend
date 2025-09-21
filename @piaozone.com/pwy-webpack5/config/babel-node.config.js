/* eslint-disable */
const path = require('path');
const fs = require('fs');

module.exports = ({ isEnvDevelopment, pwyWebpackNodeDir, nodeModulesDir }) => {
    return {
	  "presets": [
		[
		  require.resolve(path.join(pwyWebpackNodeDir, "@babel/preset-env")),
		  {
			"useBuiltIns": "usage",
			"corejs": {
			  "version": 3,
			  "proposals": true
			}
		  }
		],
		require.resolve(path.join(pwyWebpackNodeDir, "@babel/preset-typescript"))
	  ],
	  "plugins": [
		require.resolve(path.join(pwyWebpackNodeDir, "@babel/plugin-proposal-class-properties")),
		require.resolve(path.join(pwyWebpackNodeDir, "@babel/plugin-proposal-object-rest-spread"))
	  ]
	};
}