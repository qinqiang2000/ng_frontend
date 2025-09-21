module.exports = {
    "setupFiles": [
        './tests/setup.js',  // 测试启动文件
    ],
    "moduleFileExtensions": [
      "js",
      "jsx"
    ],
    "moduleDirectories": ["node_modules", "src"],
    "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/tests/"
    ],
    "transform": {
      "^.+\\.js$": "babel-jest"
    }
}