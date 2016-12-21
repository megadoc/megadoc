const React = require('react');
const CorpusAPI = require('core/CorpusAPI');
const { PropTypes } = React;

const CorpusReceiver = Component => {
  return React.createClass({
    contextTypes: {
      corpus: PropTypes.instanceOf(CorpusAPI).isRequired,
    },

    render() {
      return (
        <Component corpus={this.context.corpus} {...this.props} />
      );
    }
  });
};

module.exports = CorpusReceiver;
