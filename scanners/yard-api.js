#!/usr/bin/env node

var dox = require('dox');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Logger = require('../lib/Logger');

module.exports = function(tiny, config, tinyConfig/*, utils*/) {
  var console = new Logger('yard-api scanner');
  var assetRoot = tinyConfig.root;

  glob(path.resolve(assetRoot, config.source), { nodir: true }, function (err, files) {
    var database = files.map(function(fileName) {
      return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
    });

    // TODO
    tiny.done(database);
  });
};
