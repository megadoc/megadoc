module.exports = function(runners, runnerArgs, done) {
  var resultSet = [];

  if (runners.length === 0) {
    done();
    return;
  }

  function runAt(cursor) {
    var runner = runners[cursor];

    if (!runner) {
      done(null, resultSet);
      return;
    }

    runner.apply(runner, runnerArgs.concat([
      function(err, result) {
        if (err) { // abort
          done(err);
        }
        else {
          resultSet.push(result);
          runAt(cursor + 1);
        }
      }
    ]));
  }

  runAt(0);
};