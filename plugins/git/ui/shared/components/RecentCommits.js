var React = require('react');
var MarkdownText = require('components/MarkdownText');
var { Link } = require('react-router');

var RecentCommits = React.createClass({
  propTypes: {
    commits: React.PropTypes.arrayOf(React.PropTypes.shape({
      commit: React.PropTypes.object,
      author: React.PropTypes.object,
      subject: React.PropTypes.string,
      body: React.PropTypes.string
    })),

    activeCommitId: React.PropTypes.string,
    since: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      commits: [],
      activeCommitId: undefined
    };
  },

  render: function() {
    const { commits } = this.props;

    return (
      <div className="recent-commits">
        {commits.length === 0 && (
          <p>There was no activity during the last period ({this.props.since}).</p>
        )}

        {commits.length > 0 && (
          <ul className="recent-commits__listing">
            {commits.map(this.renderLink)}
          </ul>
        )}

        {this.props.activeCommitId && this.renderCommit(this.props.activeCommitId)}
      </div>
    );
  },

  renderLink(commit) {
    return (
      <li key={commit.commit.short}>
        <Link to="git" query={{ commit: commit.commit.short }}>{commit.subject}</Link>
        {' '}
        <span className="type-mute">by {commit.author.name}</span>
      </li>
    );
  },

  renderCommit(sha) {
    const commit = this.props.commits.filter((c) => c.commit.short === sha)[0];

    if (!commit) {
      return (<p>Woot? No such commit with SHA {sha}.</p>);
    }

    return (
      <div className="recent-commits__commit">
        <MarkdownText>{commit.renderedSubject}</MarkdownText>

        {commit.renderedBody ? (
          <MarkdownText>{commit.renderedBody}</MarkdownText>
        ) : (
          <p>No body provided</p>
        )}
      </div>
    );
  }
});

module.exports = RecentCommits;