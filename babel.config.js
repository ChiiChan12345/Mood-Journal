module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
      [
        'module-resolver',
        {
          alias: {
            'tty': 'tty-browserify',
            'stream': 'stream-browserify',
            'util': 'util/',
            'assert': 'assert/',
            'http': 'stream-http',
            'https': 'https-browserify',
            'os': 'os-browserify/browser',
            'url': 'url/',
            'crypto': 'crypto-browserify',
          },
        },
      ],
    ],
  };
}; 