const React = require('react');
const scrollToTop = require('utils/scrollToTop');

const Landing = React.createClass({
  componentDidMount() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
        Hi! Is JavaScript time!
      </div>
    );
  }
});

module.exports = Landing;