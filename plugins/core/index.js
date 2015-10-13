var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');
var merge = require('lodash').merge;
var defaults = require('./config');
var fs = require('fs');

exports.name = 'CorePlugin';
exports.run = function(compiler) {
  var config = merge({}, defaults, compiler.config);
  var utils = compiler.utils;
  var database = {};

  compiler.on('scan', function(done) {
    var svc = Promise.resolve();

    if (config.gitStats && config.readme) {
      var filePaths = [ utils.getAssetPath(config.readme) ];

      svc = parseGitStats(config.gitRepository, filePaths).then(function(stats) {
        database.readmeGitStats = stats[0];
      });
    }

    svc.then(function() { done(); }, done);
  });

  compiler.on('render', function(renderMarkdown, linkify, done) {
    if (config.readme) {
      database.readme = renderMarkdown(
        linkify(
          fs.readFileSync(compiler.utils.getAssetPath(config.readme), 'utf-8')
        )
      );
    }

    if (config.footer) {
      database.footer = renderMarkdown(linkify(config.footer));
    }

    done();
  });

  compiler.on('write', function(done) {
    write(config, compiler, database, done);
  });
};

exports.testRouter = function(done) {
  var React = require('react');
  var ReactRouter = require('react-router');

  var routeMap = React.createElement(ReactRouter.Route, {
    path: '/',
    name: 'root',
    handler: React.createClass({
      render: function() {
        return null;
      }
    })
  });

  console.log(typeof ReactRouter.match)

  ReactRouter.run({
    location: ReactRouter.StaticLocation,
    path: null,
    routes: routeMap
  }, function() {
    done();
  });
};
