var inferModuleId = require('../inferModuleId');
var expect = require('chai').expect;
var dox = require('dox');

var load = TestUtils.loadFixture;

function parse(fixtureName) {
  return dox.parseComments(load(fixtureName), {
    skipSingleStar: true,
    raw: true
  });
}

describe('DoxParser/inferModuleId', function() {
  it('@class with a name but no description', function() {
    var docs = parse('cjs/class00.js');
    expect( inferModuleId(docs[0]) ).to.equal('Foo');
  });

  it('@class with a name and description', function() {
    var id = inferModuleId(parse('cjs/class01.js')[0]);

    expect(id).to.equal('Foo');
  });

  it('named function() with a description', function() {
    expect( inferModuleId(parse('cjs/class02.js')[0]) ).to.equal('Foo');
  });

  it('@constructor with a description', function() {
    expect( inferModuleId(parse('cjs/class03.js')[0]) ).to.equal('Foo');
  });

  it('module.exports = function() {} with a description', function() {
    var doc = parse('cjs/class04.js')[0];

    expect(
      inferModuleId(
        doc,
        TestUtils.getFixturePath('cjs/class04.js')
      )
    ).to.equal('class04');
  });

  it('@class with a declaration (var LayoutList = ...) with a description', function() {
    expect( inferModuleId(parse('cjs/class05.js')[0]) ).to.equal('LayoutList');

  });

  it('a declaration (var LayoutList = ...) with a description', function() {
    expect( inferModuleId(parse('cjs/class06.js')[0]) ).to.equal('LayoutList');
  });

  it('a declaration with a @namespace', function() {
    expect( inferModuleId(parse('cjs/class08.js')[0]) ).to.equal('EventEmitter');
  });
});