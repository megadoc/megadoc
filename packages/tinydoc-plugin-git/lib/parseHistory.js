var log = require('git-log-parser');
var fs = require('fs');
var path = require('path');

function parseMailMap(rawMailMap) {
  // Braden Anderson <banderson@instructure.com> Braden Anderson <braden@instructure.com>
  return rawMailMap.trim().split("\n").reduce(function(mailMap, line) {
    var match = line.match(/\s*(.*) <(.*)> (.*) <(.*)>/);

    if (match) {
      mailMap.push({
        to: {
          name: match[1].trim(),
          email: match[2].trim()
        },
        from: {
          name: match[3].trim(),
          email: match[4].trim(),
        }
      });
    }

    return mailMap;
  }, []);
}

function analyzeTeams(people, teams) {
  return teams.map(function(teamConfig) {
    var team = {
      name: teamConfig.name,
      memberCount: teamConfig.members.length,
      age: 0,
      commitCount: 0,
      reviewCount: 0,
      firstCommitAt: 0,
      lastCommitAt: 0
    };

    teamConfig.members.forEach(function(email) {
      var person = people[email.trim()];

      if (person) {
        team.commitCount += person.commitCount;
        team.reviewCount += person.reviewCount;

        if (team.lastCommitAt === 0 || person.lastCommitAt > team.lastCommitAt) {
          team.lastCommitAt = person.lastCommitAt;
        }

        if (team.firstCommitAt === 0 || person.firstCommitAt < team.firstCommitAt) {
          team.firstCommitAt = person.firstCommitAt;
        }
      }
      else {
        console.warn("Unable to find an entry for team member <%s>", email);
      }
    });

    team.age = team.lastCommitAt - team.firstCommitAt;

    return team;
  });
}

function analyze(commits, mailMap, teams) {
  var stats = {
    commitCount: commits.length,
    people: {},
    teams: []
  };

  function getPersonRecord(_email, _name) {
    var email = _email.trim();
    var name = _name.trim();
    var person;
    var mapEntry;

    if (mailMap) {
      mapEntry = mailMap.filter(function(entry) {
        return entry.from.email === email;
      })[0];
    }

    if (mapEntry) {
      email = mapEntry.to.email;
      name = mapEntry.to.name;
    }

    person = stats.people[email];

    if (!person) {
      person = stats.people[email] = {
        email: email,
        name: name,
        commitCount: 0,
        reviewCount: 0,
        superStarIndex: 0,
        lastCommitAt: 0,
        firstCommitAt: 0
      };
    }

    return person;
  }

  console.log('Parsing stats from ' + commits.length + ' commits.');

  commits.forEach(function(commit) {
    var committer = getPersonRecord(commit.author.email, commit.author.name);
    var commitDate = (new Date(commit.author.date)).getTime();
    var reviewField, reviewer;

    committer.commitCount += 1;

    if (committer.lastCommitAt === 0 || committer.lastCommitAt <= commitDate) {
      committer.lastCommitAt = commitDate;
    }

    if (committer.firstCommitAt === 0 || committer.firstCommitAt >= commitDate) {
      committer.firstCommitAt = commitDate;
    }

    // parse "Reviewed-by: AUTHOR <EMAIL>" code review field
    reviewField = commit.body.match(/Reviewed\-by: (.*) \<([^\>]+)\>/);

    if (reviewField) {
      reviewer = getPersonRecord(reviewField[2], reviewField[1]);

      reviewer.reviewCount += 1;
    }
  });

  if (teams) {
    stats.teams = analyzeTeams(stats.people, teams);
  }
  else {
    var superStar;

    // flatten the people hash to array
    stats.people = Object.keys(stats.people).map(function(email) {
      var person = stats.people[email];

      person.superStarIndex = (
        (person.commitCount + person.reviewCount) / commits.length
      );

      if (!superStar || superStar.superStarIndex < person.superStarIndex) {
        superStar = person;
      }

      return person;
    });

    if (superStar) {
      superStar.isSuperstar = true;
    }
  }

  return stats;
}

module.exports = function(repoPath, config, done) {
  var parse = log.parse({ 'use-mailmap': true }, { cwd: repoPath });
  var commits = [];

  parse.on('data', function(commit) {
    commits.push(commit);
  });

  parse.on('end', function() {
    var mailMapPath = path.resolve(repoPath.replace(/\.git$/, ''), '.mailmap');
    var mailMap;

    if (config.useMailMap && fs.existsSync(mailMapPath)) {
      mailMap = parseMailMap(fs.readFileSync(mailMapPath, 'utf-8'));
      console.log('Will be using the git .mailmap:', JSON.stringify(mailMap));
    }

    done(null, analyze(commits, mailMap, config.teams));
  });

  parse.on('error', done);
  parse.on('close', function(exitCode) {
    if (exitCode !== 0) {
      done('git log parse failed mysteriously with exit code ' + exitCode);
    }
  });
};
