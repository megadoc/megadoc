module.exports = function(stats, md) {
  stats.recentCommits.forEach(function(commit) {
    commit.renderedSubject = md('**'+commit.subject+'**');
    commit.renderedBody = commit.body && commit.body.length > 0 ?
      md(commit.body) :
      null
    ;
  });
};