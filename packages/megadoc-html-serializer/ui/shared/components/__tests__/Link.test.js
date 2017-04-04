const Link = require('../Link');
const React = require('react');
const ReactDOM = require('react-dom');
const sinonSuite = require('test_helpers/sinonSuite');
const { assert } = require('chai');
const CorpusAPI = require('core/CorpusAPI');
const { drill } = require('react-drill');
const { string, func, shape, object, } = React.PropTypes;
const { assign } = require('lodash');

describe('megadoc::Components::Link', function() {
  let linkContext;
  const sinon = sinonSuite(this);
  const Subject = React.createClass({
    childContextTypes: {
      config: object,
      navigate: func,
      location: shape({
        pathname: string,
      })
    },

    getChildContext() {
      return linkContext;
    },

    render() {
      return <Link {...this.props} />
    }
  });

  let subject;
  let container;

  beforeEach(function() {
    linkContext = null;
    container = document.createElement('div');
  });

  afterEach(function() {
    linkContext = null;
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  context('given @href', function() {
    it('uses it without any questions asked', function() {
      render({ href: "/foobar.js" });

      assert.include(drill(subject).node.href, '/foobar.js');
    });

    it('builds a relative URL', function() {
      render({ href: '/foo/bar.html' }, {
        location: {
          pathname: '/foo/index.html'
        }
      });

      assert.equal(drill(subject).node.href.replace(location.origin + '/', ''), 'bar.html');
    });
  });

  context('in SinglePageMode...', function() {
    context('given @to...', function() {
      let corpus;

      beforeEach(function() {
        corpus = buildSPMCorpus();
      });

      it('should use @meta.href', function() {
        render({ to: corpus.get('lua') });

        assert.include(drill(subject).node.href, '#/lua');
      });

      it('should link to entities using @meta.href', function() {
        render({ to: corpus.get('lua/from_lua') });

        assert.include(drill(subject).node.href, '#/lua/from_lua');
      });

      it('should link to entities with hashes inside their URIs', function() {
        render({ to: corpus.get('lua/cli#set_description') });

        assert.include(drill(subject).node.href, '#/lua/cli#set_description');
      });
    });
  });

  context('given @to...', function() {
    let corpus;

    beforeEach(function() {
      corpus = buildCorpus();
    });

    it('links to the node using its @href', function() {
      render({ to: corpus.get('api/Bag') });
      assert.include(drill(subject).node.href, '/api/Bag.html');
    });
  });

  context('when using file:// as a protocol', function() {
    it('renders', function() {
      render({ href: "/api.html" }, {
        location: {
          protocol: 'file:',
          pathname: '/srv/http/docs/megadoc-test/index.html'
        }
      });

      assert.ok(subject.isMounted());
    });
  });

  function render(props, context) {
    linkContext = buildContextWithDefaults(context);
    subject = ReactDOM.render(<Subject {...props} />, container);
  }

  function buildContextWithDefaults(context = {}) {
    return assign({
      navigate: sinon.stub(),
      location: assign({
        pathname: '/'
      }, context.location),
    }, context);
  }
});

function buildCorpus() {
  return CorpusAPI({ database: require('json!test_helpers/fixtures/corpus') });
}

function buildSPMCorpus() {
  return CorpusAPI({ database: require('json!test_helpers/fixtures/corpus--spm') });
}