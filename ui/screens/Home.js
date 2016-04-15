const React = require("react");
const config = require('config');
const scrollToTop = require('utils/scrollToTop');

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