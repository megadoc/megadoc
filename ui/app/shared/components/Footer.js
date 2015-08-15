var React = require('react');
var config = require('config');
var MarkdownText = require('components/MarkdownText');

var Footer = React.createClass({

  render: function() {
    return (
      <div className="root__footer">
        <MarkdownText>
          {config.footer || 'Made with &#9829; using [tinydoc](https://github.com/tinydoc).'}
        </MarkdownText>
      </div>
    );
  }

});

module.exports = Footer;