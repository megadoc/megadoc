var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var publicModules = require('./publicModules');

exports.apply = function(config) {
  const outputDir = config && config.outputDir || path.resolve(__dirname, '..', 'tmp');
  const tmpl = _.template(fs.readFileSync(path.resolve(__dirname, 'publicModules.tmpl.js'), 'utf-8'));
  const outputPath = path.join(outputDir, 'publicModules.js');

  fs.ensureDirSync(outputDir);
  fs.writeFileSync(outputPath, tmpl({
    externals: Object.keys(publicModules)
  }));

  return outputPath;
};