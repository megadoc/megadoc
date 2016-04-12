var React = require('react');
var RecentCommits = require('components/RecentCommits');
var Leaderboard = require('components/Leaderboard');
var TeamLeaderboard = require('components/TeamLeaderboard');
var Superstars = require('components/Superstars');
var config = require('config');

var Root = React.createClass({
  propTypes: {
    query: React.PropTypes.shape({
      commit: React.PropTypes.string
    })
  },

  render: function() {
    const { history } = config.stats;

    return (
      <div className="git-root">
        <h2>Recent Activity</h2>

        <RecentCommits
          commits={config.stats.recentCommits}
          activeCommitId={this.props.query.commit}
          since={config.recentCommits.since}
        />

        {config.superStars && (
          <div>
            <h2>Superstars</h2>

            <Superstars people={config.stats.history.people} />
          </div>
        )}

        {history.teams.length > 0 && (
          <div>
            <h2>Team Breakdown</h2>
            <TeamLeaderboard teams={history.teams} />
          </div>
        )}

        {history.teams.length === 0 && (
          <div>
            <h2>Ladder</h2>

            <p className="git-root__troll">
              A rundown of exactly how much work every team member does (:troll:).
            </p>

            <Leaderboard
              committers={config.stats.history.people}
            />
          </div>
        )}

      </div>
    );
  }
});

module.exports = Root;