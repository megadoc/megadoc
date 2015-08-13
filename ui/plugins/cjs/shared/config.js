var { findWhere, merge } = require('lodash');
var defaults = require('../../defaults');
var config = window['tinydoc-js-scanner-config'] || {};

// locate the react-repoter output config
var appConfig = merge({},
  findWhere(defaults.output, { format: 'react' }),
  findWhere(config.output, { format: 'react' }),
  { database: config.database }
);
console.log(appConfig);

module.exports = appConfig;