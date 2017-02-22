const React = require('react');
const { any, string, bool } = React.PropTypes;

const HighlightedText = React.createClass({
  propTypes: {
    children: any,
    className: string,
    unsafe: bool,
  },

  render() {
    if (this.props.unsafe) {
      return (
        <div
          className={`highlighted-text ${this.props.className || ''}`}
          children={this.props.children}
        />
      );
    }

    return (
      <div
        className={`highlighted-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{__html: this.props.children}}
      />
    );
  }
});

module.exports = HighlightedText;