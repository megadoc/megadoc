module.exports = {
  command: 'bundle exec rake yard_api',
  source: 'public/doc/api/**/*.json',
  exclude: null,
  showEndpointPath: false,
  skipScan: false,
  routeName: 'api',
  navigationLabel: 'API',
};