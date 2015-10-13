var chai = require('chai');
var sinon = require('sinon');

global.TestUtils = require('../lib/TestUtils');

sinon.assert.expose(chai.assert, { prefix: "" });
