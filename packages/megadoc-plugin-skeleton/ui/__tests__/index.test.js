const Subject = require('../');
const React = require('react');
const jsdom = require('jsdom');

describe('index', function() {
  var document, container;
  beforeEach(function() {
    document = jsdom.html();

    container = document.createElement('div');

    global.window = document;
    global.document = document;
  });

  afterEach(function() {
    global.window = global.document = null;
  });

  it('works!', function() {
    var el = React.render(<Subject />, container);

    console.log(React.findDOMNode(el).outerHTML);
  });
});