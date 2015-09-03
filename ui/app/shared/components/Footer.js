const React = require('react');
const config = require('config');
const MarkdownText = require('components/MarkdownText');
const TwoColumnLayout = require('components/TwoColumnLayout');

const Footer = React.createClass({
  componentDidMount: function() {
    TwoColumnLayout.on('resize', this.resize);
  },

  render: function() {
    return (
      <div
        className="root__footer"
        style={{ left: TwoColumnLayout.getSidebarWidth() }}
      >
        <MarkdownText>
          {config.footer}
        </MarkdownText>
      </div>
    );
  },

  resize() {
    this.forceUpdate();
  }
});

module.exports = Footer;