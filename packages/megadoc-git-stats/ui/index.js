const GitStatsOutlet = require('./outlets/GitStatsOutlet')

module.exports = {
  name: 'megadoc-git-stats',
  plugin: true,
  outlets: [
    'GitStats',
  ],

  outletOccupants: [
    { name: 'GitStats', component: GitStatsOutlet, },
  ]
}