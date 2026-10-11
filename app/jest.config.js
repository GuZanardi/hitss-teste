module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|lucide-react-native)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
};
