// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 🔧 CJS 확장자 오류 방지
config.resolver.sourceExts.push('cjs');

module.exports = config;
