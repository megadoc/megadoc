var React = require("react");
var config = require('config');
var HighlightedText = require('components/HighlightedText');
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
          <HighlightedText>{config.readme.source}</HighlightedText> :
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