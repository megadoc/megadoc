var parseProperty = require('../parseProperty');
var expect = require('chai').expect;

describe('DoxParser/parseProperty', function() {
  it("should work", function() {
    var fixture = "{React.Component} [children=<button>Show Popup</button>]\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip.";
    var info = parseProperty(fixture);

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
    var info = parseProperty(fixture);

    expect(info).to.contain({
      name: 'children',
      optional: true,
      description: "\n\nElement to use as the popup's \"toggle\" button, which when clicked will\nshow the qTip."
    });

    expect(info.types).to.contain('Object[]');
  });

  it("should work with array default values (e.g. [something=[]])", function() {
    var fixture = "{Object[]} [filterOptions=[]]\n\ntest.";
    var info = parseProperty(fixture);

    expect(info).to.contain({
      name: 'filterOptions',
      optional: true,
      defaultValue: '[]',
      description: "\n\ntest."
    });

    expect(info.types).to.contain('Object[]');
  });
});
