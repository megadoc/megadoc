const React = require('react');
const MarkdownText = require('components/MarkdownText');
const { PropTypes } = React;

const Footer = React.createClass({
  propTypes: {
    children: PropTypes.string,
  },

  render() {
    return (
      <div className="footer">
        <MarkdownText>
          {this.props.children || ''}
        </MarkdownText>
      </div>
    );
  }
});

module.exports = Footer;