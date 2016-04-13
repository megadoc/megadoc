var React = require("react");
var config = require('config');
var HighlightedText = require('components/HighlightedText');
var GitStats = require('components/GitStats');
var Disqus = require('components/Disqus');
var Footer = require('components/Footer');

const { readme } = config;

var Home = React.createClass({
  statics: {
    willTransitionTo(transition) {
      if (config.home) {
        transition.redirect(config.home);
      }
    }
  },

  render() {
    return (
      <div className="doc-content">
        {readme && <HighlightedText>{readme.source.html}</HighlightedText>}

        {readme && readme.git && config.gitStats && (
          <GitStats {...readme.git} />
        )}

        {readme && (
          <Disqus identifier={readme.filePath} title="README" />
        )}

        {config.displayFooterInHomePage && (
          <Footer />
        )}
      </div>
    );
  }
});

module.exports = Home;