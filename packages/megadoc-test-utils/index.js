const { stubConsoleWarn, stubConsoleError } = require('./watchConsole');

exports.sinonSuite = require('./SinonSuite');
exports.sinon = require('sinon');
exports.createSinonSuite = require('./SinonSuite');
exports.createFileSuite = require('./FileSuite');
exports.createIntegrationSuite = require('./createIntegrationSuite');
exports.assert = require('chai').assert;
exports.stubConsoleWarn = stubConsoleWarn;
exports.stubConsoleError = stubConsoleError;
exports.multiline = require('multiline-slash')