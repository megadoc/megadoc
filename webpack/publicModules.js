var path = require('path');
var glob = require('glob');
var root = path.resolve(__dirname, '..', 'ui');

var GLOBAL = 'tinydoc.publicModules';
var vendorModules = require('./vendorModules');

var sharedModuleDirs = [
  'components',
  'core',
  'mixins',
  'utils',
];

vendorModules.forEach(function(moduleId) {
  exports[moduleId] = GLOBAL + '["' + moduleId + '"]';
});

sharedModuleDirs.forEach(function(dir) {
  glob
    .sync(dir + '/**/*.js', { cwd: path.join(root, 'shared') })
    .filter(function(file) {
      return !file.match('.test.js');
    }).forEach(function(file) {
      var moduleId = file.replace(/^\.\/|\.js$/g, '');
      exports[moduleId] = GLOBAL + '["' + moduleId + '"]';
    })
  ;
});

