const Subject = require('../Layout');
const reactSuite = require('test_helpers/reactSuite');
const sinonSuite = require('test_helpers/sinonSuite');
const { assert } = require('chai');
const { drill, m } = require('react-drill');
const Outlet = require('components/Outlet');
const NotFound = require('components/NotFound');
const ErrorMessage = require('components/ErrorMessage');
const React = require('react');

describe('tinydoc::Components::Layout', function() {
  const sinon = sinonSuite(this);

  reactSuite(this, Subject, {
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

      subject.setProps({
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

    describe('@with', function() {
      it('injects a custom documentNode into an outlet when specified', function() {
        sinon.stub(tinydoc.corpus, 'get', () => {
          return {
            uid: 'api/something',
            title: 'World'
          }
        });

        Outlet.add('Foo', {
          key: 'asdf',
          component: React.createClass({
            render() {
              return <p>Hello {this.props.documentNode.title}!</p>
            }
          })
        });

        subject.setProps({
          pathname: '/foo',

          customLayouts: [{
            match: { by: 'url', on: '/foo' },
            regions: [
              {
                name: 'Layout::Content',
                outlets: [
                  {
                    name: 'Foo',
                    with: 'api/something'
                  }
                ]
              }
            ]
          }]
        });

        assert.calledWith(tinydoc.corpus.get, 'api/something');
        assert.include(drill(subject).node.textContent, "Hello World!");
      });

      it('displays an error when no such document is found', function() {
        sinon.spy(tinydoc.corpus, 'get');

        subject.setProps({
          pathname: '/foo',

          customLayouts: [{
            match: { by: 'url', on: '/foo' },
            regions: [
              {
                name: 'Layout::Content',
                outlets: [
                  {
                    name: 'Foo',
                    with: 'api/something'
                  }
                ]
              }
            ]
          }]
        });

        assert.calledWith(tinydoc.corpus.get, 'api/something');
        assert(
          drill(subject)
            .has(ErrorMessage, m.hasText('No document was found with the UID "api/something"'))
        );
      });
    });
  });
});