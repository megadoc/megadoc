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
  });
});