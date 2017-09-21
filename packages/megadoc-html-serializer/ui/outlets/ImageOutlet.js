const React = require('react');
const { shape, string } = React.PropTypes;
const resolvePathname = require('utils/resolvePathname');

const ImageOutlet = React.createClass({
  contextTypes: {
    location: shape({
      pathname: string,
    }),
  },

  propTypes: {
    $outletOptions: shape({
      src: string.isRequired,
    }).isRequired,
  },

  render() {
    return (
      <img src={resolvePathname(this.props.$outletOptions.src, this.context.location.pathname)} />
    );
  }
});

module.exports = ImageOutlet