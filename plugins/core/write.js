var fs = require('fs-extra');
var path = require('path');
var root = path.resolve(__dirname, '..', '..');
var _ = require('lodash');
var compileCSS = require('./write/compileCSS');
var compileInlinePlugins = require('./write/compileInlinePlugins');
var runAll = require('../../lib/utils/runAll');
var CORE_SCRIPTS = ['config.js', 'vendor.js', 'main.js'];
var CORE_STYLE = path.resolve(root, 'ui', 'css', 'index.less');

module.exports = function(config, compiler, database, done) {
  compiler.assets.styleSheets.unshift(CORE_STYLE);

  runAll([ compileInlinePlugins, compileCSS ], [ compiler, config ], function(err) {
    if (err) {
      done(err);
      return;
    }

    copyFavicon(compiler, config);
    copyAssets(compiler, config.assets);
    copyAppScripts(compiler);
    generateHTMLFile(compiler, config);
    generateRuntimeConfigScript(compiler, config, database);

    done();
  });
};

function copyFavicon(compiler, config) {
  var utils = compiler.utils;

  if (config.favicon) {
    fs.copySync(
      utils.getAssetPath(config.favicon),
      utils.getOutputPath('favicon.ico')
    );
  }
}

function copyAssets(compiler, staticAssets) {
  staticAssets.forEach(function(asset) {
    compiler.assets.add(asset);
  });

  compiler.assets.files.forEach(function(entry) {
    if (entry.hasCustomOutputPath) {
      console.log('Copying asset "%s" => "%s".', entry.sourcePath, entry.outputPath);

    }
    else {
      console.log('Copying asset "%s".', entry.sourcePath);
    }

    fs.copySync(
      entry.isAbsolute ?
        '/' + entry.sourcePath :
        compiler.utils.getAssetPath(entry.sourcePath)
      ,
      compiler.utils.getOutputPath(entry.outputPath)
    );
  });

  compiler.assets.pluginScripts.forEach(function(filePath) {
    fs.copySync(
      filePath,
      compiler.utils.getOutputPath('plugins', path.basename(filePath))
    );
  });
}

function generateHTMLFile(compiler, config) {
  var scripts = CORE_SCRIPTS
    .concat(compiler.assets.runtimeScripts)
    .concat(
      compiler.assets.pluginScripts.map(function(filePath) {
        return 'plugins/' + path.basename(filePath);
      })
    )
  ;

  if (compiler.assets.hasInlinePlugins()) {
    scripts.push('inline_plugins.js');
  }

  var tmpl = _.template(
    fs.readFileSync(path.join(root, 'ui', 'index.tmpl.html'), 'utf-8')
  );

  var html = tmpl({
    title: config.title,
    metaDescription: config.metaDescription,
    scripts: scripts.map(function(script) {
      return path.join(config.publicPath, script);
    })
  });


  fs.writeFileSync(compiler.utils.getOutputPath('index.html'), html);
}

// copy the pre-compiled webpack bundles
function copyAppScripts(compiler) {
  fs.copySync(path.join(root, 'dist'), compiler.utils.getOutputPath());
}

function generateRuntimeConfigScript(compiler, config, database) {
  var runtimeConfig = _.extend(
    {},
    _.omit(config, [ 'outputDir', 'plugins', 'assets', ]),
    {
      pluginCount: (
        compiler.assets.pluginScripts.length +
        (compiler.assets.hasInlinePlugins() ? 1 : 0)
      ),
      pluginConfigs: compiler.assets.runtimeConfigs
    }
  );

  console.log('Registered UI plugins:',
    compiler.assets.pluginScripts.map(function(filePath) {
      return path.basename(filePath);
    })
  );

  if (database.readme) {
    runtimeConfig.readme = {
      filePath: config.readme,
      source: database.readme,
      git: database.readmeGitStats
    };
  }
  if (database.footer) {
    runtimeConfig.footer = database.footer;
  }

  // write the runtime config file
  compiler.utils.writeAsset('config.js',
    'window.CONFIG=' + JSON.stringify(runtimeConfig) + ';'
  );
}