import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      eqeqeq: ["off", "always"],
      "@typescript-eslint/ban-ts-comment": "off",
      curly: "error",
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      // '@typescript-eslint/no-explicit-any': 'warn',
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // '@typescript-eslint/no-unused-vars': [
      //     'warn',
      //     { argsIgnorePattern: '^_' },
      // ],
      "react/no-children-prop": "off",
      curly: "off",
    },
  },
];

export default eslintConfig;