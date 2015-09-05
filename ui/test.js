const chai = require('chai');
const sinon = require('sinon');

sinon.assert.expose(chai.assert, { prefix: "" });

const tests = require.context('./', true, /^\.\/(app|plugins).*\/__tests__\/.*.test.js$/);
tests.keys().forEach(tests);
