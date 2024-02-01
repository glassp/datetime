module.exports = {
    plugins: [
        "unused-imports"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
    },
    extends: [
        "prettier"
    ],
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "no-console": [
            "error",
            {
                "allow": [
                    "warn"
                ]
            }
        ],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                "vars": "all",
                "varsIgnorePattern": "^_",
                "args": "after-used",
                "argsIgnorePattern": "^_"
            }
        ]
    }
}