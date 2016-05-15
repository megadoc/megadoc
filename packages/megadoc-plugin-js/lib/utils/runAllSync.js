module.exports = function runAllSync(runners, runnerArgs) {
  var i, runner;

  for (i = 0; i < runners.length; ++i) {
    runner = runners[i];
    runner.apply(runner, runnerArgs);
  }
};