module.exports = function runAllSync(runners, runnerArgs) {
  var i, runner;
  var len = runners.length;

  for (i = 0; i < len; ++i) {
    runner = runners[i];
    runner.apply(runner, runnerArgs);
  }
};