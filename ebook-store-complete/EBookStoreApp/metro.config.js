const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver alias for web platform to mock Stripe
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add resolver for web platform
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;
