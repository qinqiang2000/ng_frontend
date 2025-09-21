const path = require('path');

const projectDir = path.resolve('./');
const projectNode = path.join(projectDir, "node_modules");
const curDir = path.resolve(__dirname);
const pwyNode = path.join(curDir, "../../node_modules");
const program = require('commander');

program.option('--type [type]', 'project type')
	.option('-c, --config [type]', 'jest config')
	.parse(process.argv);
const argv = program.opts();

let myConfig = {};

if (argv.config) {
    myConfig = require(path.join(projectDir, argv.config));
}

let setupFiles = [path.join(curDir, 'setup.js')];

const coverageThreshold = {
	"global": {
		"branches": 80, // 分支覆盖率
		"functions": 80, // 函数覆盖率
		"lines": 60, // 行覆盖率
		"statements": 60 // 语句覆盖率
	},
	"**/*.js": {
		"branches": 80, // 分支覆盖率
		"functions": 80, // 函数覆盖率
		"lines": 60, // 行覆盖率
		"statements": 60 // 语句覆盖率
	}
};

if (argv.type === 'lib') {
    setupFiles = [path.join(curDir, 'setup-lib.js')];
}else if (argv.type === 'node') {
    setupFiles = [];
}

// 计算哪些文件的覆盖率
const collectCoverageFrom = myConfig.collectCoverageFrom || [
	"<rootDir>/src/**/*.js",
	"<rootDir>/src/**/*.jsx"
];

// lib类型的不需要jsx覆盖率
if (!myConfig.disabledJsxCoverageThreshold && argv.type !== 'lib') {
	coverageThreshold["**/*.jsx"] = {
		"branches": 80, // 分支覆盖率
		"functions": 80, // 函数覆盖率
		"lines": 60, // 行覆盖率
		"statements": 60 // 语句覆盖率
	};
}

module.exports = {
	"rootDir": projectDir,
    "setupFiles": setupFiles,
    "moduleFileExtensions": myConfig.moduleFileExtensions || [
      "js",
      "jsx",
	  "json"
    ],
    "coverageThreshold": coverageThreshold,
    "cacheDirectory": path.join(projectNode, '.jestCache'),
	"modulePaths": [projectNode, pwyNode],
	"moduleNameMapper": {
		"^enzyme$": path.join(pwyNode, "enzyme"),
        "^enzyme-adapter-react-16$": path.join(pwyNode, "enzyme-adapter-react-16"),
        "^react-test-renderer$": path.join(pwyNode, "react-test-renderer"),
	},
	"coverageDirectory": path.join(projectDir, "coverage"),
　　"collectCoverageFrom": collectCoverageFrom,
    "moduleDirectories": ["node_modules", "src"],
    "coveragePathIgnorePatterns": myConfig.coveragePathIgnorePatterns || [
		"/dist/",
        "/config/",
        "/mock/",
        "/uploadDir/",
        "/run/",
        "/logs/",
        "/node_modules/",
        "/test/"
    ],
    "transform": {
	  "^.+\\.jsx?$": path.join(curDir, './wrapper.js')
    }
}