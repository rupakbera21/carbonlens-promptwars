// @ts-check

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    rules: {
      // Security
      "no-eval": "error",
      "no-implied-eval": "error",

      // Code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      ".firebase/",
      "coverage/",
      "docker/",
      "public/sw.js",
    ],
  },
];

export default config;
