var global = window.tinydocReact;
var publicModules = require('defaults').ui.publicModules;
var publicModuleContext = require.context('./shared', true, /.*\.js$/);

window.React = require('react');
window.ReactRouter = require('react-router');
window._ = require('lodash');

publicModuleContext.keys().forEach(function(moduleFile) {
  var moduleId = moduleFile.replace(/^\.\/|\.js$/g, '');

  if (publicModules.indexOf(moduleId) > -1) {
    global[moduleId] = publicModuleContext(moduleFile);
  }
});
