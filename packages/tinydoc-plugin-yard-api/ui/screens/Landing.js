var React = require('react');
const scrollToTop = require('utils/scrollToTop');

var Index = React.createClass({
  componentDidMount() {
    scrollToTop();
  },

  render() {
    return (
      <div className="doc-content">
        Welcome to the API docs!
      </div>
    );
  }
});

module.exports = Index;