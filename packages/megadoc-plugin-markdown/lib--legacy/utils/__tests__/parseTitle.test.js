var parseTitle = require('../parseTitle');
var expect = require('chai').expect;
var multiline = require('multiline-slash');

describe('markdown/scan/parseTitle', function() {
  it('should work', function() {
    var fixture = multiline(function() {;
      // # Testing CommonJS Modules
      //
      // Something.
      //
      // ## A little about Mocha
    }, true);

    expect(parseTitle(fixture)).to.equal('Testing CommonJS Modules');
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

    expect(parseTitle(fixture)).to.equal('Support Week');
  });
});