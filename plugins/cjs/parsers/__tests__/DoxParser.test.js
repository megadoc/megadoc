var Subject = require('../DoxParser');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

function load(fixtureName) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures', fixtureName), 'utf-8');
}

describe('DoxParser', function() {
  describe('.parseProperty', function() {
    it("should work", function() {
      var fixture = "{React.Component} [children=<button>Show Popup</button>]\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip.";
      var info = Subject.parseProperty(fixture);

      expect(info).to.contain({
        name: 'children',
        optional: true,
        defaultValue: '<button>Show Popup</button>',
        description: "\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip."
      });

      expect(info.types).to.contain('React.Component');
    });

    it("should work with array types (e.g. Object[])", function() {
      var fixture = "{Object[]} [children]\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip.";
      var info = Subject.parseProperty(fixture);

      expect(info).to.contain({
        name: 'children',
        optional: true,
        description: "\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip."
      });

      expect(info.types).to.contain('Object[]');
    });

    it("should work with array default values (e.g. [something=[]])", function() {
      var fixture = "{Object[]} [filterOptions=[]]\n\ntest.";
      var info = Subject.parseProperty(fixture);

      expect(info).to.contain({
        name: 'filterOptions',
        optional: true,
        defaultValue: '[]',
        description: "\n\ntest."
      });

      expect(info.types).to.contain('Object[]');
    });
  });

  describe('#parseString', function() {
    var subject;

    beforeEach(function() {
      subject = new Subject();
    });

    describe('inferring module ID', function() {
      it('@class with a name but no description', function() {
        var docs = subject.parseString(load('class00.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({
          id: 'Foo'
        });

        expect(docs[0].ctx).to.contain({
          name: 'Foo'
        });
      });

      it('@class with a name and description', function() {
        var docs = subject.parseString(load('class01.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({
          id: 'Foo'
        });

        expect(docs[0].ctx).to.contain({ name: 'Foo' });
        expect(docs[0].description).to.contain({ full: 'Barred?' });
      });

      it('named function() with a description', function() {
        var docs = subject.parseString(load('class02.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({
          id: 'Foo'
        });

        expect(docs[0].ctx).to.contain({ name: 'Foo' });
        expect(docs[0].description).to.contain({ full: 'Barred?' });
      });

      it('@constructor with a description', function() {
        var docs = subject.parseString(load('class02.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({
          id: 'Foo'
        });

        expect(docs[0].ctx).to.contain({ name: 'Foo' });
        expect(docs[0].description).to.contain({ full: 'Barred?' });
      });

      it('module.exports = function() {} with a description', function() {
        var docs = subject.parse(path.join(__dirname, '/fixtures/class04.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({
          id: 'Class04'
        });

        expect(docs[0].ctx).to.contain({ name: 'Class04' });
        expect(docs[0].description).to.contain({ full: 'Barred?' });
      });

      it('@class with a declaration (var LayoutList = ...) with a description', function() {
        var docs = subject.parse(path.join(__dirname, '/fixtures/class05.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({ id: 'LayoutList' });
        expect(docs[0].ctx).to.contain({ name: 'LayoutList' });
        expect(docs[0].description).to.contain({ full: 'Beware...' });
      });

      it('a declaration (var LayoutList = ...) with a description', function() {
        var docs = subject.parse(path.join(__dirname, '/fixtures/class06.js'));

        expect(docs.length).to.equal(1);
        expect(docs[0]).to.contain({ id: 'LayoutList' });
        expect(docs[0].ctx).to.contain({ name: 'LayoutList' });
        expect(docs[0].description).to.contain({ full: 'Beware...' });
      });



    });
  });
});