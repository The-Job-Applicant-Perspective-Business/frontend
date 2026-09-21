// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import globals from "globals"; // 1. Inject the globals package

export default tseslint.config(
  // 1. GLOBAL IGNORES (Environment Optimization)
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "tailwind.config.ts",
      "**/.eslintcache"
    ],
  },

  // 2. BASE RULES
  js.configs.recommended,
  ...tseslint.configs.recommended,

// 3. NEXT.JS, REACT & STORYBLOK CONFIGURATION
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      globals: {
        ...globals.browser, // 2. Hardwire the browser globals
        ...globals.node,    // 3. Hardwire the node globals
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Core Plugin Rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...jsxA11yPlugin.configs.recommended.rules,

      // Component Architecture
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],

      // Logic Purity Overrides
      "react/prop-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",

      // 🔒 Tightened: TypeScript Integrity
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      // --- NEXT.JS SEMANTIC INTEGRITY (The Prophet's Audit) ---
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: "Use Next.js <Link> from 'next/link' to maintain client-side routing integrity and avoid full-page reloads.",
        },
        {
          selector: "JSXOpeningElement[name.name='img']",
          message: "Use Next.js <Image> from 'next/image' to enforce Core Web Vitals and prevent layout shifts.",
        }
      ],

      // Accessibility Hardening (WCAG 2.2 AA)
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
    },
  },

  // 4. PRETTIER (The Final Firewall)
  prettierConfig
);