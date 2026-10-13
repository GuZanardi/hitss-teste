module.exports = (api) => {
  const isTest = api.env('test');
  api.cache.using(() => isTest);

  return {
    presets: [
      [
        'module:@react-native/babel-preset',
        isTest ? {} : { jsxImportSource: 'nativewind' },
      ],
      ...(!isTest ? ['nativewind/babel'] : []),
    ],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          allowlist: ['API_URL'],
          allowUndefined: false,
        },
      ],
    ],
  };
};
