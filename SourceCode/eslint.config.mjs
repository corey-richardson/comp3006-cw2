import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "react/prop-types": "off",
            "react/jsx-uses-vars": "error",
            "no-unused-vars": ["warn", { 
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            "no-console": "warn",
            "quotes": ["error", "double", { avoidEscape: true }],
            "indent": ["error", 4, { SwitchCase: 1 }],
            "no-trailing-spaces": "error",
            "semi": ["error", "always"],
            "array-bracket-spacing": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
