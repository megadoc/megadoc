const Subject = require('../Link');
const React = require('react');
const { assert } = require('chai');

let originalLocation;

describe("Link", function() {
  let subject;
  let container;

  beforeEach(function() {
    originalLocation = window.location;
    container = document.createElement('div');
  });

  afterEach(function() {
    restoreLocation();

    React.unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  context('when using file:// as a protocol', function() {
    beforeEach(function() {
      stubLocation({
        protocol: 'file:'
      });
    });

    it('renders', function() {
      subject = React.render(<Subject to="/api.html" />, container);

      assert.ok(subject.isMounted());
    });
  });

});


function stubLocation(newLocation) {
  // Object.defineProperty(window, 'location', {
  //   configurable: true,
  //   enumerable: true,
  //   writable: true,
  //   value: newLocation
  // });
}

function restoreLocation() {
  // window.location = originalLocation;
}