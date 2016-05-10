const Subject = require("../Article");
const reactSuite = require("test_helpers/reactSuite");
const { assert } = require('chai');

describe("Markdown::Components::Article", function() {
  reactSuite(this, Subject, {
    documentNode: {
      meta: {},
      properties: {
        source: 'Hello World!'
      }
    }
  });

  it('renders', function() {
    assert(subject.isMounted());
  });
});