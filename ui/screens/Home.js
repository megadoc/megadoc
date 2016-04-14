const React = require("react");
const config = require('config');
const HighlightedText = require('components/HighlightedText');
const GitStats = require('components/GitStats');
const Disqus = require('components/Disqus');
const Footer = require('components/Footer');
const scrollToTop = require('utils/scrollToTop');
const { readme } = config;

const Home = React.createClass({
  statics: {
    willTransitionTo(transition) {
      if (config.home) {
        transition.redirect(config.home);
      }
    }
  },

  componentDidMount() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
      </div>
    );
  }
});

module.exports = Home;