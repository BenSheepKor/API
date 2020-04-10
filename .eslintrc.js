module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "prefer-const": "error",
    "curly": "error",
    "default-case": "error",
    "eqeqeq": "error",
    "no-empty-function": "error",
    "no-eval": "error",
    "no-console": 0,
    "no-empty": 0,
    "no-irregular-whitespace": 0,
    // styling
    "camelcase": ["error", {allow: ["joined_at", "last_log_in"]}],
    "indent": ["error", "tab"],
  },
};
