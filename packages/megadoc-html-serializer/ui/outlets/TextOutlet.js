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
    const props = this.props.$outletOptions;
    const HTMLTag = props.tagName || 'div';

    return (
      <HTMLTag className={props.className} title={props.title} children={props.text} />
    );
  }
});

module.exports = TextOutlet;