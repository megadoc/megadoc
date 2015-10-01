var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var externals = require('./externals');

exports.apply = function(compiler) {
  var tmpl = _.template(fs.readFileSync(path.resolve(__dirname, 'publicModules.tmpl.js'), 'utf-8'));
  var outputDir = path.resolve(__dirname, '..', 'tmp');
  var outputPath = path.join(outputDir, 'publicModules.js');

  fs.ensureDirSync(outputDir);
  fs.writeFileSync(outputPath, tmpl({
    externals: Object.keys(externals)
  }));
};