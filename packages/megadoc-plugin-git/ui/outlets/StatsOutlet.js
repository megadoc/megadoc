const React = require('react');
const GitStats = require('../components/GitStats');
const { object } = React.PropTypes;

const StatsOutlet = React.createClass({
  propTypes: {
    documentNode: object,
  },

  render() {
    const { documentNode } = this.props;

    if (!documentNode || !documentNode.meta.gitStats) {
      return null;
    }

    return (
      <GitStats {...documentNode.meta.gitStats} />
    );
  }
});

megadoc.outlets.add('Git::Stats', {
  key: 'Git::Stats',
  component: StatsOutlet
});

megadoc.outlets.add('Layout::Content', {
  key: 'Git::Stats',
  component: StatsOutlet,
  match(props) {
    return props.documentNode && !!props.documentNode.meta.gitStats;
  }
});

module.exports = StatsOutlet;
