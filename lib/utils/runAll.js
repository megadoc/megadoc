module.exports = function(runners, runnerArgs, done) {
  var statusSet = new WeakSet();
  var resultSet = [];
  var failed = false;

  function isStillRunning() {
    return runners.some(function(runner) { return !statusSet.has(runner); });
  }

  function runnerDone(err, rc) {
    if (err) {
      failed = true;
      done(err);
      return;
    }

    statusSet.add(this);
    resultSet.push(rc);

    if (!isStillRunning()) {
      done(null, resultSet);
    }
  }

  runners.forEach(function(runner) {
    if (!failed) {
      runner.apply(runner, runnerArgs.concat(runnerDone.bind(runner)));
    }
  });

  if (!runners.length) {
    done();
  }
};