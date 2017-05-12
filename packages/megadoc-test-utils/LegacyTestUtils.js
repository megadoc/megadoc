var path = require('path');
var fs = require('fs-extra');
var merge = require('lodash').merge;
var set = require('lodash').set;
var root = path.resolve(__dirname, '..', 'tmp');
var Compiler = require('megadoc-compiler');
var assert = require('chai').assert;
var multiline = require('multiline-slash');
var cheerio = require('cheerio');
var htmlPrinter = require('html');
var glob = require('glob');
var sinon = require('sinon');

sinon.assert.expose(assert, { prefix: "" });

var TestUtils = exports;
var TEST_REPO_PATH = path.resolve(__dirname, '../../tmp/test-repo');
var gid = 0;

exports.contentBase = root;

exports.getInlineString = require('multiline-slash');
exports.generateTestConfig = function(config) {
  return merge({}, require('megadoc-compiler/lib/config'), {
    tmpDir: path.join(TEST_REPO_PATH, '.megadoc'),
    outputDir: path.join(TEST_REPO_PATH, 'compiled-docs'),
    assetRoot: TEST_REPO_PATH,
  }, config);
};

exports.sinonSuite = function(suite) {
  var sandbox = sinon.sandbox.create();

  suite.beforeEach(function() {
    sandbox.restore();
  });

  suite.afterEach(function() {
    sandbox.restore();
  });

  return sandbox;
};

exports.createCompiler = function(config) {
  return {
    run(runConfig) {
      return Compiler.run(Object.assign({}, config, runConfig));
    }
  }
  // return new Compiler(TestUtils.generateTestConfig(config));
};

exports.tempPath = function(fileName) {
  return path.resolve(TEST_REPO_PATH, interpolateGUID(fileName));
};

exports.tempDir = function(dirName) {
  if (dirName.length === 0) {
    return TEST_REPO_PATH;
  }

  var dirPath = exports.tempPath(dirName);

  fs.ensureDirSync(dirPath);

  return dirPath;
};

exports.createFile = function(contents, fileName) {
  var filePath = exports.tempPath(fileName || '~file--[guid]');

  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf-8');

  return {
    path: filePath,
    contents: contents
  };
};

exports.removeFiles = function() {
  exports.clearCache();
};

exports.clearCache = function() {
  fs.removeSync(TEST_REPO_PATH);
};

exports.IntegrationSuite = IntegrationSuite;

function prettyPrintDOM(dom) {
  return htmlPrinter.prettyPrint(
    dom('#__app__')
      .innerHTML
        .replace(/data\-reactid\=\"[^\"]+\"\s?/g, '')
  );
}

function interpolateGUID(string) {
  return string.replace('[guid]', guid()).replace('[gid]', function() {
    return ++gid;
  });
}

// courtesy of http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

if (process.env.MEGADOC_TEST_CACHE !== '1') {
  afterEach(function() {
    TestUtils.clearCache();
  });
}

/**
 * @module TestUtils.IntegrationSuite
 *
 * @param {mocha} mochaSuite
 * @param {Object} suiteOptions
 * @param {Number} [suiteOptions.timeout=2000]
 */
function IntegrationSuite(mochaSuite, suiteOptions) {
  suiteOptions = suiteOptions || {};

  var suiteRoot, config, compiler;
  var exports = {};

  mochaSuite.timeout(process.env.MEGADOC_TEST_TIMEOUT ?
    parseInt(process.env.MEGADOC_TEST_TIMEOUT, 10) :
    (suiteOptions.timeout || 2000)
  );

  mochaSuite.beforeEach(function() {
    suiteRoot = interpolateGUID(path.resolve(__dirname, '../../tmp/test-repo__[gid]-[guid]'));

    config = merge({}, require('megadoc-compiler/lib/config'), {
      verbose: false,
      compileCSS: false,
      assetRoot: suiteRoot,
      tmpDir: path.join(suiteRoot, 'tmp'),
      outputDir: path.join(suiteRoot, 'www'),
    }, config);

    // compiler = new Compiler(config);
  });

  if (process.env.MEGADOC_TEST_CACHE !== '1') {
    mochaSuite.afterEach(function() {
      fs.removeSync(suiteRoot);
    });
  }

  /**
   * Override compiler config.
   *
   * @param  {Object} overrides
   */
  exports.configure = function(overrides) {
    merge(config, overrides);
  };

  /**
   * Override a single compiler config item.
   *
   * @param {String} key
   *        This can be a deep path.
   *
   * @param {Any} value
   */
  exports.set = function(key, value) {
    set(config, key, value);
  };

  /**
   * Perform a compilation.
   *
   * @param  {Object}   [runOptions={}]
   *         Options to pass to [Compiler#run]().
   *
   * @param {Function} done
   * @param {Error} [done.error]
   * @param {Object} [done.stats]
   */
  exports.run = function(runOptions, done) {
    if (arguments.length === 1) {
      done = runOptions;
      runOptions = {};
    }

    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(require('megadoc-html-serializer')(config));
    config.plugins.forEach(function(plugin) {
      assert(plugin.run instanceof Function,
        "A plugin must define a 'run' function." +
        (plugin.name ? ' (Name: ' + plugin.name + ')' : '')
      );

      plugin.run(compiler);
    });

    Compiler.run(merge({
      scan: true,
      render: true,
      write: true,
      stats: true,
      purge: true
    }, config, runOptions), done);
  };

  /**
   * Create a temporary file.
   *
   * @param  {String} fileName
   *         Relative file path.
   *
   * @param  {String|Function} contentsFn
   *         The contents of the file. If it's a function, we'll multiline-slash
   *         it.
   *
   * @return {Object} file
   * @return {String} file.path
   * @return {String} file.contents
   */
  exports.createFile = function(fileName, contentsFn) {
    var filePath = path.join(config.assetRoot, fileName || '~file--[guid]');
    var contents = contentsFn instanceof Function ? multiline(contentsFn) : contentsFn;

    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, contents, 'utf-8');

    return { path: filePath, contents: contents };
  };

  /**
   *
   * Assert that a file was emitted and contained something that is not 404.
   *
   * @param {String} fileName
   *        The file path (relative to outputDir) that you're expecting.
   *
   * @param  {String} fileName
   *         The same path you used to create the file with [#createFile]().
   *
   * @param {Object} assertions
   * @param {String} [assertions.text]
   * @param {String} [assertions.html]
   */
  exports.assertFileWasRendered = function(fileName, assertions) {
    var filePath = path.join(config.outputDir, fileName);

    if (!fs.existsSync(filePath)) {
      var fileList = glob.sync('**/*.html', { cwd: config.outputDir });

      assert(false, "\n" +
        "HTML file was not written to \"" + fileName + "\". List of files that *were* emitted:\n" +
        [''].concat(fileList).join('\n\t- '));
    }

    const $ = cheerio.load(fs.readFileSync(filePath, 'utf-8'));

    assert(!$('.four-oh-four'),
      "The application 404-ed. DOM:\n" + prettyPrintDOM($)
    );

    if (assertions && assertions.text) {
      assert.include($('#__app__').textContent, assertions.text);
    }

    if (assertions && assertions.html) {
      assert.include($('#__app__').innerHTML, assertions.html);
    }
  };

  exports.engageSinglePageMode = function(customLayout) {
    exports.set('layoutOptions.singlePageMode', true);
    exports.set('layoutOptions.customLayouts', [].concat(customLayout));
  };

  Object.defineProperty(exports, 'compiler', {
    get: function() {
      return compiler;
    }
  });

  return exports;
};
