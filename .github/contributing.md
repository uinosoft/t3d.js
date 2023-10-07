# t3d.js Contributing Guide

## Issue Reporting Guidelines

Welcome to use [Github](https://github.com/uinosoft/t3d.js/issues) to report a issues, request a feature, or ask a question.

## Pull Request Guidelines

- Don't send PRs to the `master` branch, send them to the `dev` branch instead.
- Make sure your code lints (`npm run lint` ...).
- Branch naming convention: use kebab naming, and start with `build|ci|docs|feat|fix|perf|refactor|test`, for example: `refactor-addons-pmrem`.
- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

## Development Setup

You will need [Node.js](https://nodejs.org), and NPM (which comes with Node.js) installed on your computer.

After cloning the repository, run `npm install` to install all dependencies.

## Scripts

- `npm run build` - Build the core library to `build/t3d.js` and `build/t3d.module.js`
- `npm run dev` - This will watch the source files and rebuild the library whenever they change
- `npm run doc` - This will build the api documentation to `docs/`
- `npm run lint` - This will lint the source files using ESLint
- `npm run server` - This will start a local server where you can view the examples or docs

## Git Commit Message Convention

Currently follows [Angular's commit convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).

## Code Formatting

Currently, we use eslint to perform code specification and style checks to ensure code uniformity.

You can use npm scripts to lint the code, but it is more recommended to use an editor plug-in for automatic code formatting.

If you use VSCode, you can install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) plug-in and enable the auto-fix option in the settings:

````json
{
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
  }
}
````

## Naming Conventions

- Variable names use camelCase notation, for example: `camera`, `renderer`.
- Class file name, class name uses camel case nomenclature, for example: `OrbitControls.js`, `OrbitControls`.
- Use kebab naming for folder names, for example: `kebab`, `kebab-case`.

## Comments

We use [JSDoc](https://jsdoc.app/) to generate api documentation, so all the public methods and properties should be documented with JSDoc.

## Project Structure

A overview of project structure:

```bash
├─ 📁 .github/            # Github related files
│  ├─ 📁 workflows/       # Github ci workflows
|  ├─ 📄 contributing.md  # Contributing guide
├─ 📁 build/              # Build output
├─ 📁 docs/               # Documentation output (not tracked by git)
├─ 📁 examples/           # Examples
│  ├─ 📁 jsm/             # Addons for t3d.js, exported to `t3d/addons/`
├─ 📂 node_modules/       # Dependencies (not tracked by git)
│  ├─ 📁 rollup           # Rollup dependencies
│  └─ 📁 ...              # Other dependencies (@eslint, @jsdoc, etc.)
├─ 📁 src/                # Source code for core package
│  ├─ 📁 ...              # The core source files in sub category
│  ├─ 📄 main.js          # The entry root, export all modules from /src
├─ 📁 tests/              # Tests
├─ 📁 tools/              # Some build tools
│  ├─ 📄 doc.config.json  # JSDoc config
│  ├─ 📄 ...              # Other tools
├─ 📄 .editorconfig       # Editor config
├─ 📄 .eslintrc.cjs       # ESLint config
├─ 📄 .gitignore          # Git ignore
├─ 📄 icon.jpg            # Icon for t3d.js
├─ 📄 LICENSE             # License
├─ 📄 package.json        # Package.json for core package
├─ 📄 README.md           # Readme
└─ 📄 rollup.config.js    # Rollup config
```

## Credits

Thank you to all the people who have already contributed to t3d.js!

<a href="https://github.com/uinosoft/t3d.js/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=uinosoft/t3d.js" />
</a>
