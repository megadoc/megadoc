var global = window.tinydocReact;
var publicModules = require('../defaults').publicModules;
var publicModuleContext = require.context('./shared', true, /.*\.js$/);

publicModuleContext.keys().forEach(function(moduleFile) {
  var moduleId = moduleFile.replace(/^\.\/|\.js$/g, '');

  if (publicModules.indexOf(moduleId) > -1) {
    global[moduleId] = publicModuleContext(moduleFile);
  }
});

window.React = require('react');
window.ReactRouter = require('react-router');
window._ = require('lodash');
