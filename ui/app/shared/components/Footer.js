var React = require('react');
var config = require('config');
var MarkdownText = require('components/MarkdownText');

var Footer = React.createClass({

  render: function() {
    return (
      <div className="root__footer">
        <MarkdownText>
          {config.footer}
        </MarkdownText>
      </div>
    );
  }

});

module.exports = Footer;