const React = require('react');
const { shape, string } = React.PropTypes;

const TextOutlet = React.createClass({
  propTypes: {
    $outletOptions: shape({
      tagName: string,
      className: string,
      text: string.isRequired,
      title: string,
    }).isRequired,
  },

  render() {
    const { $outletOptions } = this.props;
    const HTMLTag = $outletOptions.tagName || 'div';

    return (
      <HTMLTag className={$outletOptions.className} title={$outletOptions.title} children={$outletOptions.text} />
    );
  }
});

module.exports = TextOutlet;