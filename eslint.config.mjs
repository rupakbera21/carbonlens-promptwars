// @ts-check
import eslintConfigNext from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...eslintConfigNext,
  {
    rules: {
      // Security
      "no-eval": "error",
      "no-implied-eval": "error",

      // Code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",

      // React
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",

      // Import organization enforced by clean architecture layers
      "@next/next/no-html-link-for-pages": "error",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "coverage/",
      "docker/",
      "public/sw.js",
    ],
  },
];

export default config;
