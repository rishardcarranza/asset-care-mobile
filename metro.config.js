const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support .wasm files for expo-sqlite web support
config.resolver.assetExts.push('wasm');

module.exports = config;
