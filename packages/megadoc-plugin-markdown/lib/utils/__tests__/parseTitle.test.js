var parseTitle = require('../parseTitle');
var { assert, multiline } = require('megadoc-test-utils');

describe('markdown/scan/parseTitle', function() {
  it('should work', function() {
    var fixture = multiline(function() {;
      // # Testing CommonJS Modules
      //
      // Something.
      //
      // ## A little about Mocha
    }, true);

    assert.equal(parseTitle(fixture), 'Testing CommonJS Modules');
  });

  it('should work with stroked headings', function() {
    var fixture = multiline(function() {;
      // Support Week
      // ============
      //
      // What you do
      // -----------
      //
      // Monitor #donk_users, work on high priority bugs and help with reviews.
    }, true);

    assert.equal(parseTitle(fixture), 'Support Week');
  });
});