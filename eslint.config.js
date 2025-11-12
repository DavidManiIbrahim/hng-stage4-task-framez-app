// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'import/no-unresolved': ['error', { ignore: ['dayjs'] }],
    },
  },
  // Disallow importing NavigationContainer from anywhere except the app root
  {
    files: ['**/*.{js,jsx,ts,tsx}', '!app/App.js', '!app/index.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-navigation/native',
              importNames: ['NavigationContainer'],
              message: 'Import NavigationContainer only in the app root (app/App.js or app/index.js).'
            }
          ]
        }
      ]
    }
  }
  ,
  // Allow NavigationContainer in the app root files
  {
    files: ['app/App.js', 'app/index.js'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
]);

