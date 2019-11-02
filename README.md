[![MIT Licensed][icon-mit]][license]
[![Kottans-Backend][icon-kottans-be]][kottans-backend]
[![Telegram][icon-chat]][chat]

#  NodeJS 2019 course homeworks
This repo was created for students to submit their homeworks for review. 

Install and use [yarn](https://yarnpkg.com/en/docs/install)
instead of `npm`.

### How to submit
- fork this repository
- clone your fork to your local machine: `git clone https://github.com/YOUR_USERNAME/nodejs-2019-homeworks.git`
- add this repository as an upstream: `git remote add upstream https://github.com/kottans/nodejs-2019-homeworks.git`
- in your local repository, add a folder with your github name under  `submissions` (if you haven't yet)
- in your local repository, under your name folder, add a folder with task name and put your code in the folder

  See example file structure you are expected to have below:

  ![File structure example](img/file-structure.png)
- make sure your code conforms to [code quality rules](CODE_QUALITY.md)
- if your project has dependencies (i.e. its own `package.json`)
  then complete the following in order to pass CI checks:
  - put all required files in your project directory only
  - in the root `package.json` add a build integration script
    (right before `postinstall` script) following the template:
    `"install:<your-github-name>/<your-project-name>": "cd ./path/to/your/project && yarn"`
- make pull-request to this repository following these steps:
  - `git checkout master` and then create new branch, name it according to task performed (aka feature branch): `git checkout -b port-sniffer`. In this example feature branch is called `port-sniffer`
  - commit your changes to newly created feature branch
  - checkout `master` branch: `git checkout master`
  - pull latest changes from upstream `master` branch: `git pull upstream master`
  - merge `master` branch into your feature branch: `git checkout port-sniffer && git merge master`
  - resolve merge conflicts if there are any
  - push feature branch to your remote repository: `git push --set-upstream origin port-sniffer`
  - make pull-request from your repository to this repository via GitHub web-interface
- post a link to your subtask PR in the
     [BE Questionarium chat](https://t.me/joinchat/DqrdixM_mjurcmQkkQ11Og)
     and ask mentors for a code review
     * wait for review from course mentors
     * if necessary, make changes, until your code will be approved and merged
     * once the code review phase successfully finished
     and you have an approval from one of the mentors
     add to your `kottans-backend/README.md`
     a link to subtask code base and
     a note saying `Reviewed and approved by @<mentor>`
     (use mentor's github username)
   * list your reflections on this subtask
     (_what was new to you_, _what surprised you_, _what you intend to use in future_)
     
[icon-mit]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/OleksiyRudenko/a-tiny-JS-world/blob/master/LICENSE.md
[icon-chat]: https://img.shields.io/badge/chat-on%20telegram-blue.svg

[icon-kottans-be]: https://img.shields.io/badge/%3D(%5E.%5E)%3D-backend-yellow.svg
[kottans-backend]: https://github.com/kottans/backend
[chat]: https://t.me/joinchat/Dqrdixe1c2K9bXUFBzNWtg
