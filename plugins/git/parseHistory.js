var log = require('git-log-parser');
var console = require('../../lib/Logger')('git');

function analyze(commits) {
  var stats = {
    commitCount: commits.length,
    people: {}
  };

  function getPersonRecord(_email, _name) {
    var email = _email.trim();
    var name = _name.trim();
    var person = stats.people[email];

    if (!person) {
      person = stats.people[email] = {
        email: email,
        name: name,
        commitCount: 0,
        reviewCount: 0,
        superStarIndex: 0
      };
    }

    return person;
  }

  console.log('Parsing stats from ' + commits.length + ' commits.');

  commits.forEach(function(commit) {
    var email = commit.author.email;
    var committer = getPersonRecord(commit.author.email, commit.author.name);

    committer.commitCount += 1;

    // parse "Reviewed-by: AUTHOR <EMAIL>" code review field
    var reviewField = commit.body.match(/Reviewed\-by: (.*) \<([^\>]+)\>/);
    if (reviewField) {
      var reviewer = getPersonRecord(reviewField[2], reviewField[1]);

      reviewer.reviewCount += 1;
    }
  });

  var superStar;

  // flatten the people hash to array
  stats.people = Object.keys(stats.people).map(function(email) {
    var person = stats.people[email];
    person.superStarIndex = (person.commitCount + person.reviewCount) / commits.length;

    if (!superStar || superStar.superStarIndex < person.superStarIndex) {
      superStar = person;
    }

    return person;
  });

  superStar.isSuperstar = true;

  return stats;
}

module.exports = function(repoPath, config) {
  return new Promise(function(resolve, reject) {
    var parse = log.parse({}, { cwd: repoPath });
    var commits = [];

    parse.on('data', function(commit) {
      commits.push(commit);
    });

    parse.on('end', function(commit) {
      resolve(analyze(commits));
    });
  });
};
