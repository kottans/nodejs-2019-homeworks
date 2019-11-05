### Code Quality Requirements for Homeworks

The code submitted to this repository is required to match [JavaScript Standard Style](https://standardjs.com/).

Please follow these steps:
1. After cloning this repository install the dependencies (run `npm install` or `yarn` in project directory). This will install the following tools:
    - [semistandard](https://github.com/standard/semistandard) - JavaAscript Standard style guide, linter and formatted, plus semicolon requirement

1. Install plugins for Semistandard code style for your code editor. Here is an [example for VSCode](https://marketplace.visualstudio.com/items?itemName=flet.vscode-semistandard). Additionally you can enable "formatOnSave" option in your code editor, so that Standard plugin will format your code every time you save a file.

1. Before submitting the PR run `npm run lint:js --fix` or `yarn run lint:js --fix`. This will check your code and fix all auto-fixable errors like missing semicolons or spaces. After that fix the remaining errors (if any).

1. This repository also enables Standard check on pre-commit hook, so you should not be able to commit any code not conforming to ESLint rules.

1. Make sure your files end with an empty line.
   Most of the IDEs are capable of doing this for you.
   We've added the `.editorconfig` for you which is
   supported by many IDEs. 
