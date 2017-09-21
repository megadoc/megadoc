const assert = require('chai').assert;
const TestUtils = require('../TestUtils');

const parseInline = TestUtils.parseInline;

describe('jsdoc-parser-extended [#regression]', function() {
  it('comment preceded by a destructured declaratiaon not separated by semicolon...', function() {
    const withoutSemicolon = parseInline(`
      const x = { y }

      /**
       * @module
       */
      const apply = 'a'
    `);

    assert.equal(withoutSemicolon.length, 0);

    const withSemicolon = parseInline(`
      const x = { y };

      /**
       * @module
       */
      const apply = 'a'
    `);

    assert.equal(withSemicolon.length, 1);
  });
});