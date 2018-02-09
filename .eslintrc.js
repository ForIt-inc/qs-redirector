module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": ["airbnb-base"],
  "plugins": ["import", "ava", "promise"],
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  "rules": {
    "arrow-body-style": [
      "error",
      "as-needed", {
        "requireReturnForObjectLiteral": true
      }
    ],
    "ava/assertion-arguments": "error",
    "ava/max-asserts": ["off", 5],
    "ava/no-async-fn-without-await": "error",
    "ava/no-cb-test": "off",
    "ava/no-duplicate-modifiers": "error",
    "ava/no-identical-title": "error",
    "ava/no-ignored-test-files": "off",
    "ava/no-invalid-end": "error",
    "ava/no-nested-tests": "error",
    "ava/no-only-test": "error",
    "ava/no-skip-assert": "error",
    "ava/no-skip-test": "error",
    "ava/no-statement-after-end": "error",
    "ava/no-todo-implementation": "error",
    "ava/no-todo-test": "warn",
    "ava/no-unknown-modifiers": "error",
    "ava/prefer-async-await": "error",
    "ava/prefer-power-assert": "off",
    "ava/test-ended": "error",
    "ava/test-title": ["error", "if-multiple"],
    "ava/use-t-well": "error",
    "ava/use-t": "error",
    "ava/use-test": "error",
    "ava/use-true-false": "error",
    "camelcase": 0,
    "curly": 2,
    "comma-dangle": [
      "error", "only-multiline"
    ],
    "dot-notation": 1,
    "eqeqeq": 1,
    "import/no-extraneous-dependencies": ["error", {
      devDependencies: ["spec/**", "test.**.js", "test/**", "tests/**", "**/__tests__/**", "conf/**", "src/**/test.**.js", "src/**/**.test.js"],
      optionalDependencies: false,
    }],
    "no-cond-assign": 1,
    "no-continue": 1,
    "no-console": 0,
    "no-dupe-args": 2,
    "no-dupe-keys": 2,
    "no-duplicate-case": 1,
    "no-func-assign": 2,
    "no-multi-spaces": [
      1, {
        "exceptions": {
          "VariableDeclaration": true,
          "ImportDeclaration": true
        }
      }
    ],
    "no-process-exit": 1,
    "no-trailing-spaces": 1,
    "no-underscore-dangle": 0,
    "no-unexpected-multiline": 1,
    "no-unreachable": 2,
    "promise/always-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/catch-or-return": "error",
    "promise/no-native": "off",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "warn",
    "promise/no-return-in-finally": "warn",
    "quotes": [
      0, "single"
    ],
    "strict": 0
  },
  "settings": {
    "import/resolver": {
      "babel-module": {},
      "node": {
        extensions: [".es6", ".js", ".mjs"],
        paths: ["./", "./node_modules"]
      }
    }
  }
};
