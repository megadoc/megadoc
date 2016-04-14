const React = require('react');
const HighlightedText = require('components/HighlightedText');
const { shape, string, arrayOf, number } = React.PropTypes;

const StaticFile = React.createClass({
  propTypes: {
    file: shape({
      html: string,
      toc: arrayOf(shape({
        html: string,
        id: string,
        level: number,
        scopedId: string,
        text: string,
      }))
    }),
  },

  render() {
    return (
      <HighlightedText children={this.props.file.html} />
    );
  }
});

module.exports = StaticFile;
