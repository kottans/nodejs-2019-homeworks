### Code Quality Requirements for Homeworks

The code submitted to this repository is required to be formatted with [Prettier](https://github.com/prettier/prettier) (for config details see "prettier" section in `package.json`) and match [Airbnb code style](https://github.com/airbnb/javascript). Please follow these steps:
1. After cloning this repository install the dependencies (run `yarn` in project directory). This will install the following tools:
    - eslint
    - eslint-config-airnbn-base
    - prettier
    - eslint-config-prettier
    - eslint-plugin-prettier

1. Install plugins for ESLint and Prettier for your code editor. Additionally you can enable "formatOnSave" option in your code editor, so that Prettier plugin will format your code every time you save a file.

1. Before submitting the PR run `yarn run lint:js` and fix errors (if any).

1. This repository also enables ESLint change on pre-commit hook, so you should not be able to commit any code not conforming to ESLint rules.