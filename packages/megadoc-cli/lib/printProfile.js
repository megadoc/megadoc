const Table = require('cli-table');

module.exports = function printProfile(profile) {
  const table = new Table({
    head: ['Stage', 'Elapsed (ms)']
  });

  profile.benchmarks.forEach(({ stage, elapsed }) => {
    table.push([ stage, elapsed ]);
  })

  console.log(table.toString());
}