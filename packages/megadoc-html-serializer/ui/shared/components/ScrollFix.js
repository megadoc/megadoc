const React = require("react");
const scrollToTop = require('utils/scrollToTop');
const { get } = require('lodash');
const { PropTypes } = React;

const ScrollFix = React.createClass({
  propTypes: {
    scope: PropTypes.shape({
      documentNode: PropTypes.object,
    }),
  },

  componentWillReceiveProps(nextProps) {
    if (get(nextProps, 'scope.documentNode.uid') !== get(this.props, 'scope.documentNode.uid')) {
      scrollToTop();
    }
  },

  render() {
    return null
  },
});

module.exports = ScrollFix;
