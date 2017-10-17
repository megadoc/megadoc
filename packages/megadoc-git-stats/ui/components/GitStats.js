const React = require('react');
const Gravatar = require('./Gravatar');
const { sortBy } = require('lodash');
const { PropTypes } = React;

const GitStats = React.createClass({
  propTypes: {
    avatarSize: PropTypes.number,
    updated_at: PropTypes.number,
    authors: PropTypes.arrayOf(PropTypes.shape({
      c: PropTypes.number,
      n: PropTypes.string,
      e: PropTypes.string,
    })),
  },

  render() {
    if (!this.props.updated_at) {
      return null
    }

    const lastCommittedAt = new Date(this.props.updated_at * 1000);

    return (
      <div className="git-stats">
        <p>Last edited on {formatDate(lastCommittedAt)} and authored by:</p>

        <ul className="git-stats__committers-list">
          {sortBy(this.props.authors, 'c').map(this.renderCommitter)}
        </ul>
      </div>
    );
  },

  renderCommitter(committer) {
    const { n: name, e: email } = committer;

    return (
      <li key={email} className="git-stats__committers-list-item">
        <Gravatar
          title={name}
          email={email}
          size={this.props.avatarSize}
        />
      </li>
    );
  }
});

function formatDate(d) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`
}

module.exports = GitStats;