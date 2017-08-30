const React = require('react');
const config = require('config');
const MarkdownText = require('components/MarkdownText');

const Footer = React.createClass({
  render() {
    return (
      <div className="footer">
        <MarkdownText>
          {config.footer}
        </MarkdownText>
      </div>
    );
  }
});

module.exports = Footer;