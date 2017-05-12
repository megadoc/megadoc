const Subject = require('../Layout');
const reactSuite = require('test_helpers/reactSuite');
const stubRoutingContext = require('test_helpers/stubRoutingContext');
const stubAppContext = require('test_helpers/stubAppContext');
const { assert } = require('chai');
const { drill, m } = require('react-drill');
const NotFound = require('components/NotFound');
const ErrorMessage = require('components/ErrorMessage');
const React = require('react');
const { OutletManager } = require('react-transclusion');
const CorpusAPI = require('core/CorpusAPI');

describe('megadoc::Components::Layout', function() {
  let outletManager;

  beforeEach(function() {
    outletManager = OutletManager({
      strict: false,
      verbose: false
    })
  });

  const suite = reactSuite(this, stubAppContext(stubRoutingContext(Subject), () => {
    return {
      outletManager
    }
  }), {
    pathname: '/',
    template: {
      regions: [],
      hasSidebarElements: false,
    },

    scope: {},
  });

  it('renders', function() {
    assert.ok(suite.getSubject().isMounted());
  });

  it('renders NotFound if there is nothing to show', function() {
    assert.ok(drill(suite.getSubject()).has(NotFound));
  });

  describe('@using', function() {
    const corpus = CorpusAPI({
      database: require('json!test_helpers/fixtures/corpus--small.json'),
      redirect: {}
    });

    it('injects a custom documentNode into an outlet when specified', function() {
      outletManager.define('TestOutlet');
      outletManager.add('TestOutlet', {
        key: 'asdf',
        component: React.createClass({
          propTypes: {
            documentNode: React.PropTypes.object,
          },
          render() {
            return <p>Hello {this.props.documentNode.title}!</p>
          }
        })
      });

      suite.setProps({
        pathname: '/foo',

        template: {
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'TestOutlet',
                  using: 'api/foo',
                  scope: {
                    documentNode: corpus.get('api/foo')
                  }
                }
              ]
            }
          ]
        }
      });

      assert.include(drill(suite.getSubject()).node.textContent, "Hello Foo!");
    });

    it('displays an error when the outlet is not defined', function() {
      suite.setProps({
        pathname: '/foo',

        template: {
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'Foo',
                  scope: {}
                }
              ]
            }
          ]
        }
      });

      drill(suite.getSubject()).find(ErrorMessage,
        m.hasText('Outlet "Foo" has not been defined!')
      );
    });

    it('displays an error when the document to be injected was not found', function() {
      outletManager.define('Foo');

      suite.setProps({
        pathname: '/foo',

        template: {
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'Foo',
                  using: 'api/something',
                  scope: null
                }
              ]
            }
          ]
        }
      });

      drill(suite.getSubject()).find(ErrorMessage,
        m.hasText('No document was found with the UID "api/something"')
      );
    });
  });
});