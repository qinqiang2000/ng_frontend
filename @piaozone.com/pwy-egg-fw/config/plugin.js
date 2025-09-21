'use strict';

// add you build-in plugin here, example:
// exports.nunjucks = {
//   enable: true,
//   package: 'egg-view-nunjucks',
// };


exports.redis = {
	enable: true,
	package: 'egg-redis'
}

exports.sessionRedis = {
  enable: true,
  package: 'egg-session-redis'
};

exports.assets = {
  enable: true,
  package: 'egg-view-assets',
}

exports.nunjucks = {
	enable: true,
	package: 'egg-view-nunjucks',
};