/* eslint-env node */
module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    ignorePatterns: ["dist/"],
    rules: {
        "@typescript-eslint/no-var-requires": 1,
        "no-useless-escape": 0,
        semi: 1,
    },
};
