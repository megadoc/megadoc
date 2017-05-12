const path = require('path');
const fs = require('fs-extra');
const { run: compile } = require('megadoc-compiler');
const assert = require('chai').assert;
const cheerio = require('cheerio');
const glob = require('glob');
const htmlPrinter = require('html');
const FileSuite = require('./FileSuite');

const defaultTimeout = process.env.MEGADOC_TEST_TIMEOUT &&
  parseInt(process.env.MEGADOC_TEST_TIMEOUT, 10) ||
  2000
;

/**
 * @module TestUtils.IntegrationSuite
 *
 * @param {mocha} mochaSuite
 * @param {Object} suiteOptions
 * @param {Number} [suiteOptions.timeout=2000]
 */
function createIntegrationSuite(mochaSuite, suiteOptions = {}) {
  const exports = {};
  const fileSuite = FileSuite(mochaSuite, {
    purge: suiteOptions.purge,
  });

  mochaSuite.timeout(suiteOptions.timeout || defaultTimeout);

  Object.defineProperty(exports, 'root', {
    get() { return fileSuite.getRootDirectory() }
  });

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
  exports.compile = function(config, runOptions, done) {
    if (arguments.length === 2) {
      done = runOptions;
      runOptions = {};
    }

    const suiteRoot = fileSuite.getRootDirectory();
    const withDefaults = Object.assign({
      assetRoot: suiteRoot,
      tmpDir: path.join(suiteRoot, 'tmp'),
      outputDir: path.join(suiteRoot, 'www'),

      serializer: ['megadoc-html-serializer', {
        verbose: false,
        compileCSS: false,
      }],

    }, config);

    return compile(withDefaults, Object.assign({ purge: true, }, runOptions), done);
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
  exports.createFile = function() {
    return fileSuite.createFile.apply(null, arguments);
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
    const outputDir = path.join(fileSuite.getRootDirectory(), 'www');
    var filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(filePath)) {
      var fileList = glob.sync('**/*.html', { cwd: outputDir });

      assert(false, "\n" +
        "HTML file was not written to \"" + fileName + "\". List of files that *were* emitted:\n" +
        [''].concat(fileList).join('\n\t- '));
    }

    const $ = cheerio.load(fs.readFileSync(filePath, 'utf-8'));

    if ($('.four-oh-four').length) {
      assert(false, "The application 404-ed. DOM:\n" + prettyPrintDOM($));
    }

    if (assertions && assertions.text) {
      assert.include($('#__app__').text(), assertions.text);
    }

    if (assertions && assertions.html) {
      assert.include($('#__app__').html(), assertions.html);
    }
  };

  return exports;
};

function prettyPrintDOM(dom) {
  return htmlPrinter.prettyPrint(
    dom('#__app__')
      .html()
        .replace(/data\-reactid\=\"[^\"]+\"\s?/g, '')
  );
}

module.exports = createIntegrationSuite;