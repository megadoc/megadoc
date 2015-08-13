var Subject = require('../scanner');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

describe('scanner', function() {
  describe('@scanForTitle', function() {
    it('should work', function() {
      var fixture = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'fixture.md'), 'utf-8');
      expect(Subject.scanForTitle(fixture)).to.equal('Testing CommonJS Modules');
    });

    it('should work with stroked headings', function() {
      var fixture = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'fixture_with_stroked_headings.md'), 'utf-8');
      expect(Subject.scanForTitle(fixture)).to.equal('Support Week');
    });
  });

  describe('@scanForSections', function() {
    it('should work', function() {
      var fixture = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'fixture.md'), 'utf-8');
      var sections = Subject.scanForSections(fixture);

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
      var fixture = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'fixture_with_stroked_headings.md'), 'utf-8');
      var sections = Subject.scanForSections(fixture);

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
});