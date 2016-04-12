var React = require('react');
const Gravatar = require('components/Gravatar');

var GitStats = React.createClass({
  propTypes: {
    committers: React.PropTypes.object,
    lastCommittedAt: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
  },

  getDefaultProps: function() {
    return {
      committers: []
    };
  },

  render: function() {
    return (
      <div className="git-stats">
        {Object.keys(this.props.committers).length > 0 && (
          this.renderCommitters()
        )}
      </div>
    );
  },

  renderCommitters() {
    var lastCommittedAt = new Date(this.props.lastCommittedAt * 1000);

    return (
      <div className="git-stats__committers">
        This file was last edited at {lastCommittedAt.toString()} and was contributed to by
        the following team members:

        <ul className="git-stats__committers-list">
          {Object.keys(this.props.committers).map(this.renderCommitter)}
        </ul>
      </div>
    );
  },

  renderCommitter(email) {
    var committer = { email, name: this.props.committers[email] };

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