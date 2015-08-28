var parseSections = require('../parseSections');
var expect = require('chai').expect;

describe('markdown/scan/parseSections', function() {
  it('should work', function() {
    var fixture = TestUtils.getInlineString(function() {
      // # Testing CommonJS Modules
      //
      // ## Second-level
      //
      // ### Third-level
      //
      // #### Fourth-level header
    }, true);

    var sections = parseSections(fixture);

    expect(sections.length).to.equal(2);
    expect(sections).to.contain({
      level: 2,
      title: 'Second-level'
    });

    expect(sections).to.contain({
      level: 3,
      title: 'Third-level'
    });

    expect(sections).not.to.contain({
      level: 4,
      title: 'Fourth-level'
    });
  });

  it('should work with stroked headings', function() {
    var fixture = TestUtils.getInlineString(function() {
      // Testing CommonJS Modules
      // ========================
      //
      // Second-level
      // ------------
      //
      // ### Third-level
      //
      // #### Fourth-level header
    }, true);

    var sections = parseSections(fixture);

    expect(sections.length).to.equal(2);

    expect(sections).to.contain({
      level: 2,
      title: 'Second-level'
    });

    expect(sections).to.contain({
      level: 3,
      title: 'Third-level'
    });

    expect(sections).not.to.contain({
      level: 4,
      title: 'Fourth-level'
    });
  });
});