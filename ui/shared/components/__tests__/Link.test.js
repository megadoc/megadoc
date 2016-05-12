const Subject = require('../Link');
const React = require('react');
const sinonSuite = require('test_helpers/sinonSuite');
const { assert } = require('chai');
const CorpusAPI = require('core/CorpusAPI');
const AppState = require('core/AppState');
const { drill } = require('react-drill');

let originalLocation;

describe('tinydoc::Components::Link', function() {
  const sinon = sinonSuite(this);

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

  context('given @href', function() {
    it('uses it without any questions asked', function() {
      subject = React.render(<Subject href="/foobar.js" />, container);
      assert.include(drill(subject).node.href, '/foobar.js');
    });

    context('in SinglePageMode...', function() {
      beforeEach(function() {
        sinon.stub(AppState, 'inSinglePageMode', () => true);
      });

      it('should use @anchor as an anchor, if present', function() {
        render({ href: '/foo.html', anchor: 'foo' });

        assert.include(drill(subject).node.href, '/foo.html#foo');
      });

      it('should use the anchor found in @href, otherwise', function() {
        render({ href: '/foo.html#foo' });

        assert.include(drill(subject).node.href, '/foo.html#foo');
      });

      it('should complain if it finds no anchor', function() {
        sinon.stub(console, 'warn');

        render({ href: '/foo.html' });

        assert.calledWith(console.warn, sinon.match(/An anchor is required/));
        assert.include(drill(subject).node.href, '/foo.html');
      });
    });
  });

  context('given @to that points to a corpus node...', function() {
    let corpus;

    beforeEach(function() {
      corpus = buildCorpus();
      subject = React.render(<Subject to={corpus.get('api/foo')} />, container);
    });

    it('links to the node', function() {
      assert.include(drill(subject).node.href, '/api/foo.html');
    });

    context('in SinglePageMode...', function() {
      beforeEach(function() {
        sinon.stub(AppState, 'inSinglePageMode', () => true);
      });

      it('should use @meta.anchor', function() {
        render({ to: corpus.get('api/foo') });

        assert.include(drill(subject).node.href, '/foo.html#foo');
      });
    });
  });

  context('when using file:// as a protocol', function() {
    beforeEach(function() {
      stubLocation({
        protocol: 'file:'
      });
    });

    it('renders', function() {
      subject = React.render(<Subject href="/api.html" />, container);

      assert.ok(subject.isMounted());
    });
  });


  function render(props) {
    subject = React.render(<Subject {...props} />, container);
  }
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

function buildCorpus() {
  return CorpusAPI({
    'api': {
      type: 'Namespace',
      meta: {
        href: null
      },
      documents: [ 'api/foo' ],
    },
    'api/foo': {
      type: 'Document',
      parentNode: 'api',
      meta: {
        href: '/api/foo.html',
        anchor: 'foo'
      }
    }
  });
}