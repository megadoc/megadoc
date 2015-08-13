# Testing CommonJS Modules

We use [Mocha](mochajs.org) for writing tests, [Chai.js](chaijs.com) for assertions in `expect()` style similar to RSpec, and [Karma](karma-runner.github.io) for running the tests.

## A little about Mocha

Mocha provides us with a BDD-style of testing, familiar to those who've used RSpec, where you get to use `describe()` to specify the test subject, or a context, and `it()` to define tests. Each suite created by `describe()` can have its own `before()`, `after()`, `beforeEach()` and `afterEach()` callbacks.

```javascript
describe("my subject", function() {
    it("should speak", function() {
        // ...
    });
});
```

A neat feature in Mocha to utilize when covering a single file is the `.only()` filters; doing `describe.only()` instead of `describe()` will make Mocha only run the tests in that suite, ignoring all other tests. Similarily, you can restrict the master suite to a single test using `it.only()` instead of `it()`. This gets very hand when you want a faster feedback cycle as you're TDD-ing your shiny new module.

The following example will run only the `should squeak` test, ignoring the `should speak` one:

```javascript
describe("something", function() {
    it("should speak", function() {
    });

    it.only("should squeak", function() {
    });
});
```

You may also skip certain tests by using the `.skip()` filters; `describe.skip()` or `it.skip()`.

## Karma and running your tests

Karma is configured to pre-process all your test files through Webpack, so you don't need Webpack running as a stand-alone process to run the tests. Launching the Karma runner is done using:

```sh
./node_modules/karma/bin/karma start
```

## Writing tests

Inside your tests, you may pull in any module as you would regularly in source code. Since we're now placing our tests (almost) side-by-side with source files, you are normally 1 step away from your test subject inside a test.

The two requirements for creating test files are:

    - they should be placed in a folder called `__tests__`
    - their names should end with `.test.js`

For example, let's say we want to cover a `debounce` function defined in `shared/utils/debounce.js`, our test file should be placed in `shared/utils/__tests__/debounce.test.js`:

```javascript
// @file jsapp/shared/utils/__tests__/debounce.test.js

var subject = require("../debounce");

describe("Utils::debounce()", function() {
    it("should work", function() {
        subject();
    });
});
```

### Test helpers

Inside your tests, you have access to helpers written exclusively for testing. You can find these under `jsapp/shared/test_helpers/` - be sure to look through the files there if you're in need of functionality that someone else could've already provided!

Requiring test helpers is straightfoward; just use `test_helpers/` as the path root (since they're placed in `shared/`, our webpack module resolver will find them.) For example, a helper defined in `jsapp/shared/test_helpers/assign.js` would be required using `var assign = require("test_helpers/assign");`.

#### Shouldn't be caught!

Test.

## Debugging

The Karma runner will forward all `console` statements from the source and test files to the terminal, but if that's not enough, you can use the browser to debug the tests as you would normally the sources. Use the browser instance that is connected to Karma to click on the "DEBUG" button and launch a debug window. From there, you can optionally filter down to the test you need, and just use the browser devtools as you wish.