module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/src/test/mocks/lucide-react-native.tsx',
  },
};
