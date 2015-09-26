var arrayWrap = require('./arrayWrap');

module.exports = function runAllSync(runners, runnerArgs) {
  var i, runner;

  runners = arrayWrap(runners);

  for (i = 0; i < runners.length; ++i) {
    runner = runners[i];
    runner.apply(runner, runnerArgs);
  }
};