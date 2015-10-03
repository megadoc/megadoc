var React = require("react");
var config = require('config');
var MarkdownText = require('components/MarkdownText');
var GitStats = require('components/GitStats');
var Disqus = require('components/Disqus');
var scrollToTop = require('utils/scrollToTop');

var Home = React.createClass({
  displayName: "Home",

  statics: {
    willTransitionTo(transition) {
      if (config.home) {
        transition.redirect(config.home);
      }
    }
  },

  componentDidMount: function() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
        {config.readme ?
          <MarkdownText>{config.readme.source}</MarkdownText> :
          <p>Welcome to <strong>tiny</strong>doc!</p>
        }

        {config.gitStats && config.readme.git && (
          <GitStats {...config.readme.git} />
        )}

        {config.readme && (
          <Disqus identifier={config.readme.filePath} title="README" />
        )}
      </div>
    );
  }
});

module.exports = Home;