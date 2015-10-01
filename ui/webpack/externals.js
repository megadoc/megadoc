var path = require('path');
var glob = require('glob');
var fs = require('fs-extra');
var _ = require('lodash');
var root = path.resolve(__dirname, '..', 'app');

var vendorModules = [
  'react',
  'react-router',
  'lodash',
  'qtip',
  'marked',
  'moment',
];

var sharedModuleDirs = [
  'components',
  'core',
  'mixins',
  'utils',
];

var externals = {};
var globalName = 'tinydoc.publicModules';

vendorModules.forEach(function(moduleId) {
  externals[moduleId] = globalName + '["' + moduleId + '"]';
});

sharedModuleDirs.forEach(function(dir) {
  glob
    .sync(dir + '/**/*.js', { cwd: path.join(root, 'shared') })
    .filter(function(file) {
      return !file.match('.test.js');
    }).forEach(function(file) {
      var moduleId = file.replace(/^\.\/|\.js$/g, '');
      externals[moduleId] = globalName + '["' + moduleId + '"]';
    })
  ;
});

module.exports = externals;
