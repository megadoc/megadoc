const React = require('react');
const Browser = require('../components/Browser')
const { object } = React.PropTypes;

megadoc.outlets.add('Markdown::Browser', {
  key: 'Markdown::Browser',

  component: React.createClass({
    propTypes: {
      namespaceNode: object,
    },

    render() {
      return (
        <Browser {...this.props} />
      );
    }
  })
});
