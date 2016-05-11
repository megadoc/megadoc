const React = require('react');
const GitStats = require('../components/GitStats');
const { object } = React.PropTypes;

const StatsOutlet = React.createClass({
  propTypes: {
    documentNode: object,
  },

  render() {
    const { documentNode } = this.props;

    if (!documentNode.meta.gitStats) {
      return null;
    }

    return (
      <GitStats {...documentNode.meta.gitStats} />
    );
  }
});

tinydoc.outlets.add('Git::Stats', {
  key: 'Git::Stats',
  component: StatsOutlet
});

tinydoc.outlets.add('Layout::Content', {
  key: 'Git::Stats',
  component: StatsOutlet
});

module.exports = StatsOutlet;
