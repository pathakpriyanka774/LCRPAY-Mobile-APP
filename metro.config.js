// metro.config.js
// Expo needs @expo/metro-config for the embed/JSON serializer.
// Do NOT use @react-native/metro-config here.
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Don't add custom serializer/transformer here.
// If you need extra extensions, do it like:
// config.resolver.sourceExts.push('cjs');

module.exports = config;
