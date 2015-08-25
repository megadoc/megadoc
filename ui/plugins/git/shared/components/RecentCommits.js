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

    activeCommitId: React.PropTypes.string
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
        <ul className="recent-commits__listing">
          {commits.map(this.renderLink)}
        </ul>

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

    let body = commit.body || '';

    if (!body.length) {
      body = 'No body provided.';
    }

    return (
      <div className="recent-commits__commit">
        <MarkdownText>{`**${commit.subject}**\n\n${body}`}</MarkdownText>
      </div>
    );
  }
});

module.exports = RecentCommits;