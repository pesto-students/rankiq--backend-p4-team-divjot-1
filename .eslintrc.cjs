module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base/legacy', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 14,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: { 'eslint-disable-next-line': 0, 'consistent-return': 0 },
};
