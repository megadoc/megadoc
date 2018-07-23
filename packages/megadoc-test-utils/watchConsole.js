const { assert } = require('chai');
const { format } = require('util');
const { warn, error } = console;

const LEVEL_WARN = 1;
const LEVEL_ERROR = 1;
const expectedMessages = [];

const createMessage = args => format.apply(null, [].slice.call(args));
const isExpected = ({ message, level }) => (
  expectedMessages
    .filter(x => x.level === level)
    .some(x => message.match(x.text))
);

const failOnConsoleWarn = function() {
  const message = createMessage(arguments);

  if (!isExpected({ level: LEVEL_WARN, message })) {
    assert(false, `Unexpected console.warn() call! ${message}`);
  }
};

const failOnConsoleError = function() {
  const message = createMessage(arguments);

  if (!isExpected({ level: LEVEL_ERROR, message })) {
    assert(false, `Unexpected console.error() call! ${message}`);
  }
};

exports.watchConsole = function() {
  beforeEach(function() {
    expectedMessages.splice(0);

    console.warn = failOnConsoleWarn;
    console.error = failOnConsoleError;
  })

  afterEach(function() {
    console.error = error;
    console.warn = warn;

    expectedMessages.splice(0);
  });
}

exports.stubConsoleWarn = function(message) {
  expectedMessages.push({ level: LEVEL_WARN, text: message });
}

exports.stubConsoleError = function(message) {
  expectedMessages.push({ level: LEVEL_ERROR, text: message });
}