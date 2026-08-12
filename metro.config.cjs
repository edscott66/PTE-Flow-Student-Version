const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable package exports for Expo 52+
config.resolver.unstable_enablePackageExports = true;

// USE CUSTOM MAPPINGS FOR ROCK-SOLID RESOLUTION
// This forces specific problematic packages to use their React Native / Browser entry points
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@firebase/app': path.join(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'),
  '@firebase/auth': path.join(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
  '@firebase/firestore': path.join(__dirname, 'node_modules/@firebase/firestore/dist/index.rn.js'),
  '@google/genai': path.join(__dirname, 'node_modules/@google/genai/dist/web/index.mjs'),
  'firebase/app': path.join(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'),
  'firebase/auth': path.join(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
  'firebase/firestore': path.join(__dirname, 'node_modules/@firebase/firestore/dist/index.rn.js'),
  'path': path.join(__dirname, 'empty-module.js'),
  'fs': path.join(__dirname, 'empty-module.js'),
  'os': path.join(__dirname, 'empty-module.js'),
  'crypto': path.join(__dirname, 'empty-module.js'),
  'stream': path.join(__dirname, 'empty-module.js'),
};

const escape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

// Support modern module extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Filter out server-side files, correctly anchored to the project root
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : (config.resolver.blockList ? [config.resolver.blockList] : [])),
  new RegExp(`^${escape(path.join(__dirname, 'server.ts'))}$`),
  new RegExp(`^${escape(path.join(__dirname, 'vite.config.ts'))}$`),
  new RegExp(`^${escape(path.join(__dirname, 'api'))}[\\\\/].*`),
  new RegExp(`^${escape(path.join(__dirname, 'dist'))}[\\\\/].*`),
  new RegExp(`^${escape(path.join(__dirname, 'dist-server'))}[\\\\/].*`),
];

module.exports = config;
