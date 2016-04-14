const React = require('react');
const scrollToTop = require('utils/scrollToTop');
const config = require('config');
const HighlightedText = require('components/HighlightedText');

const Landing = React.createClass({
  propTypes: {
    routeName: React.PropTypes.string,
  },

  componentDidMount() {
    scrollToTop();
  },

  render() {
    const thisConfig = config.for(this.props.routeName);
    const { readme } = thisConfig;

    return (
      <div className="doc-content">
        {readme && <HighlightedText>{readme.html}</HighlightedText>}

        {!readme && <p>Hi! Is JavaScript time!</p>}
      </div>
    );
  }
});

module.exports = Landing;