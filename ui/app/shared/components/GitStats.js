var React = require('react');
const Gravatar = require('components/Gravatar');

var GitStats = React.createClass({
  getDefaultProps: function() {
    return {
      committers: []
    };
  },

  render: function() {
    return (
      <div className="git-stats">
        {this.props.committers.length > 0 && (
          this.renderCommitters()
        )}
      </div>
    );
  },

  renderCommitters() {
    var lastCommittedAt = new Date(this.props.lastCommittedAt);

    return (
      <div className="git-stats__committers">
        This file was last edited at {lastCommittedAt.toString()} and was contributed to by
        the following team members:

        <ul className="git-stats__committers-list">
          {this.props.committers.map(this.renderCommitter)}
        </ul>
      </div>
    );
  },

  renderCommitter(committer) {
    return (
      <li key={committer.email} className="git-stats__committers-list-item">
        <Gravatar
          title={committer.name}
          email={committer.email}
        />
      </li>
    );
  }
});

module.exports = GitStats;