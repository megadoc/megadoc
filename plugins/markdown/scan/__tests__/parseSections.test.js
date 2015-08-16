var parseSections = require('../parseSections');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

describe('markdown/scan/parseSections', function() {
  it('should work', function() {
    var fixture = TestUtils.loadFixture('markdown/fixture.md');
    var sections = parseSections(fixture);

    expect(sections.length).to.equal(5);
    expect(sections).to.contain({
      level: 2,
      title: 'A little about Mocha'
    });

    expect(sections).to.contain({
      level: 3,
      title: 'Test helpers'
    });
  });

  it('should work with stroked headings', function() {
    var fixture = TestUtils.loadFixture('markdown/fixture_with_stroked_headings.md');
    var sections = parseSections(fixture);

    expect(sections.length).to.equal(4);
    expect(sections).to.contain({
      level: 2,
      title: 'What you do'
    });

    expect(sections).to.contain({
      level: 2,
      title: 'How you do it'
    });

    expect(sections).to.contain({
      level: 3,
      title: 'Poking around in the console'
    });
  });
});