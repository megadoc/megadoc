const React = require('react');
const GitStats = require('../components/GitStats');
const { PropTypes } = React;

const GitStatsOutlet = React.createClass({
  propTypes: {
    documentNode: PropTypes.object,

    $outletOptions: PropTypes.shape({
      avatarSize: PropTypes.number,
    })
  },

  render() {
    const { documentNode } = this.props;

    if (!documentNode || !documentNode.meta.git) {
      return null;
    }

    return (
      <GitStats
        avatarSize={this.props.$outletOptions.avatarSize}
        {...documentNode.meta.git}
      />
    );
  }
});

module.exports = GitStatsOutlet;
