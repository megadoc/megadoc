const Subject = require("../Article");
const React = require('react');
const reactSuite = require("test_helpers/reactSuite");
const { assert } = require('chai');
const { object, } = React.PropTypes;

describe("Markdown::Components::Article", function() {
  reactSuite(this, React.createClass({
    childContextTypes: {
      location: object,
      config: object,
    },

    getChildContext() {
      return {
        location: {},
        config: {
          disqus: false
        }
      }
    },

    render() {
      return <Subject {...this.props} />
    }
  }), {
    documentNode: {
      meta: {},
      properties: {
        source: 'Hello World!'
      }
    }
  });

  it('renders', function() {
    assert(subject.isMounted());
  });
});