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
    expect(sections[0]).to.deep.equal({
      id: 'second-level',
      level: 2,
      title: 'Second-level',
      plainTitle: 'Second-level',
    });

    expect(sections[1]).to.deep.equal({
      id: 'third-level',
      level: 3,
      title: 'Third-level',
      plainTitle: 'Third-level',
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

    expect(sections[0]).to.contain({
      level: 2,
      title: 'Second-level',
    });

    expect(sections[1]).to.contain({
      level: 3,
      title: 'Third-level'
    });

    expect(sections).not.to.contain({
      level: 4,
      title: 'Fourth-level'
    });
  });

  it('generates a plain-text title', function() {
    var fixture = TestUtils.getInlineString(function() {
      // Testing CommonJS Modules
      // ========================
      //
      // ## Second-level [foo](http://foobar.com)
    }, true);

    var sections = parseSections(fixture);

    expect(sections.length).to.equal(1);
    expect(sections[0].plainTitle).to.equal('Second-level foo');
  });
});