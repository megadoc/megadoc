var parseTitle = require('../parseTitle');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

describe('markdown/scan/parseTitle', function() {
  it('should work', function() {
    var fixture = TestUtils.loadFixture('markdown/fixture.md');
    expect(parseTitle(fixture)).to.equal('Testing CommonJS Modules');
  });

  it('should work with stroked headings', function() {
    var fixture = TestUtils.loadFixture('markdown/fixture_with_stroked_headings.md');
    expect(parseTitle(fixture)).to.equal('Support Week');
  });
});