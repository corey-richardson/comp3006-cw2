import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";

export default [
    // ALL
    {
        files: ["**/*.{js,jsx}"],
        plugins: {
            import: importPlugin,
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": ["warn", { 
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            "no-console": "warn",
            "quotes": ["error", "double", { avoidEscape: true }],
            "indent": ["error", 4, { SwitchCase: 1 }],
            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
            "semi": ["error", "always"],
            "array-bracket-spacing": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            
            "import/order": ["error", {
                "groups": [
                    "builtin", 
                    "external", 
                    "internal", 
                    ["parent", "sibling"], 
                    "index"
                ],
                "newlines-between": "always",
                "alphabetize": {
                    "order": "asc", 
                    "caseInsensitive": true
                }
            }],
        },
    },

    // FRONTEND ONLY
    {
        files: ["frontend/src/**/*.{js,jsx}"],
        plugins: {
            react: reactPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "react/prop-types": "off",
            "react/jsx-uses-vars": "error",
        },
    }
];
