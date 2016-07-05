const React = require('react');
const Browser = require('../components/Browser')
const { object, shape, bool, } = React.PropTypes;

megadoc.outlets.add('Markdown::Browser', {
  key: 'Markdown::Browser',

  component: React.createClass({
    propTypes: {
      namespaceNode: object,
      $outletOptions: shape({
        flat: bool,
      })
    },

    render() {
      return (
        <Browser {...this.props} flat={this.props.$outletOptions.flat} />
      );
    }
  })
});
