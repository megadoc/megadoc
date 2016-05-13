const Subject = require('../Layout');
const reactSuite = require('test_helpers/reactSuite');
const sinonSuite = require('test_helpers/sinonSuite');
const stubCorpus = require('test_helpers/stubCorpus');
const stubContext = require('test_helpers/stubContext');
const { assert } = require('chai');
const { drill, m } = require('react-drill');
const Outlet = require('components/Outlet');
const NotFound = require('components/NotFound');
const ErrorMessage = require('components/ErrorMessage');
const React = require('react');

describe('tinydoc::Components::Layout', function() {
  const sinon = sinonSuite(this);

  const suite = reactSuite(this, stubContext(Subject), {
    pathname: '/'
  });

  it('renders', function() {
    assert.ok(subject.isMounted());
  });

  it('renders NotFound if there is nothing to show', function() {
    assert.ok(drill(subject).has(NotFound));
  });

  describe('@customLayouts', function() {
    beforeEach(function() {
      Outlet.reset('Foo');
      Outlet.define('Foo');
    });

    it('matches by url', function() {
      Outlet.add('Foo', {
        key: 'asdf',
        component: React.createClass({
          render() {
            return <p>Hello!</p>
          }
        })
      });

      suite.setProps({
        pathname: '/foo',

        customLayouts: [{
          match: { by: 'url', on: '/foo' },
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'Foo'
                }
              ]
            }
          ]
        }]
      });

      assert.include(drill(subject).node.textContent, 'Hello!');
    });
  });

  describe('@using', function() {
    stubCorpus(this, require('json!test_helpers/fixtures/corpus--small.json'));

    it('injects a custom documentNode into an outlet when specified', function() {
      sinon.spy(tinydoc.corpus, 'get');

      Outlet.define('TestOutlet');
      Outlet.add('TestOutlet', {
        key: 'asdf',
        component: React.createClass({
          render() {
            return <p>Hello {this.props.documentNode.title}!</p>
          }
        })
      });

      suite.setProps({
        pathname: '/foo',

        customLayouts: [{
          match: { by: 'url', on: '/foo' },
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'TestOutlet',
                  using: 'api/foo'
                }
              ]
            }
          ]
        }]
      });

      assert.calledWith(tinydoc.corpus.get, 'api/foo');
      assert.include(drill(subject).node.textContent, "Hello Foo!");
    });

    it('displays an error when no such document is found', function() {
      sinon.spy(tinydoc.corpus, 'get');

      suite.setProps({
        pathname: '/foo',

        customLayouts: [{
          match: { by: 'url', on: '/foo' },
          regions: [
            {
              name: 'Layout::Content',
              outlets: [
                {
                  name: 'Foo',
                  using: 'api/something'
                }
              ]
            }
          ]
        }]
      });

      assert.calledWith(tinydoc.corpus.get, 'api/something');

      drill(subject).find(ErrorMessage,
        m.hasText('No document was found with the UID "api/something"')
      );
    });
  });
});