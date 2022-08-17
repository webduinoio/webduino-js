module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: "eslint:recommended",
  globals: {
    Paho: false,
  },
  rules: {
    indent: ["warn", 2],
    quotes: ["warn", "single", { allowTemplateLiterals: true }],
    semi: ["warn", "always"],
    "no-unused-vars": [
      "warn",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
    "no-console": "off",
    "no-prototype-builtins": "warn"
  },
};
