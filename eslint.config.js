module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        before: "readonly",
        after: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "multi-line"]
    }
  },
  {
    files: ["public/js/**/*.js"],
    rules: {
      "no-unused-vars": [
        "warn",
        {
          "varsIgnorePattern": "^(CreatorWorkspace|DevWorkspace|Footer|Header|Hero|ResultsPanel|Animations|API)$",
          "argsIgnorePattern": "^_"
        }
      ]
    }
  }
];
