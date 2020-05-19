module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "class-methods-use-this": 0,
    "import/no-unresolved": "off",
    "import/extensions": [
      "off",
      "ignorePackages",
      {
        "ts": "always",
      }
   ]
  },
};
