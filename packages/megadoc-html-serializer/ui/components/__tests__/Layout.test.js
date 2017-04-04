/* global megadoc: false */
const Subject = require('../Layout');
const reactSuite = require('test_helpers/reactSuite');
const stubCorpus = require('test_helpers/stubCorpus');
const stubContext = require('test_helpers/stubContext');
const { assert } = require('chai');
const { drill, m } = require('react-drill');
const Outlet = require('components/Outlet');
const NotFound = require('components/NotFound');
const ErrorMessage = require('components/ErrorMessage');
const React = require('react');

describe('megadoc::Components::Layout', function() {
  const suite = reactSuite(this, stubContext(Subject), {
    pathname: '/',
    template: {
      regions: [],
      hasSidebarElements: false,
    },

    scope: {},
  });

  afterEach(function() {
    Outlet.reset();
  });

  it('renders', function() {
    assert.ok(suite.getSubject().isMounted());
  });

  it('renders NotFound if there is nothing to show', function() {
    assert.ok(drill(suite.getSubject()).has(NotFound));
  });

  describe('@using', function() {
    stubCorpus(this, require('json!test_helpers/fixtures/corpus--small.json'));

    it('injects a custom documentNode into an outlet when specified', function() {
      Outlet.define('TestOutlet');
      Outlet.add('TestOutlet', {
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
                    documentNode: megadoc.corpus.get('api/foo')
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
      Outlet.define('Foo');

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