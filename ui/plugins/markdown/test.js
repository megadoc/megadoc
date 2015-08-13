// Enforce the test environment to suppress certain messages from ReactRouter.
process.env.NODE_ENV = "test";

window.expect = require('chai').expect;

var tests = require.context('./', true, /__tests__\/.*\.test\.js$/);
tests.keys().forEach(tests);
