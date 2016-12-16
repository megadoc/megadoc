const path = require('path');
const fs = require('fs-extra');
const multiline = require('multiline-slash');

let gid = 0;

/**
 * @module FileSuite
 *
 * @param {mocha} mochaSuite
 * @param {Object} suiteOptions
 * @param {String?} suiteOptions.directory
 */
module.exports = function FileSuite(mochaSuite, suiteOptions = {}) {
  const exports = {};
  const contentBase = suiteOptions.directory || path.resolve(__dirname, '../../tmp/tests');

  let suiteRoot;

  mochaSuite.beforeEach(function() {
    suiteRoot = interpolateGUID(path.resolve(contentBase, 'test-repo__[gid]-[guid]'));

    fs.ensureDirSync(suiteRoot);
  });

  if (suiteOptions.purge === false || process.env.MEGADOC_TEST_CACHE !== '1') {
    mochaSuite.afterEach(function() {
      fs.removeSync(suiteRoot);
    });
  }

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
    var filePath = path.join(suiteRoot, fileName || '~file--[guid]');
    var contents = contentsFn instanceof Function ? multiline(contentsFn) : contentsFn;

    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, contents, 'utf-8');

    return { path: filePath, contents: contents };
  };

  exports.getRootDirectory = function() {
    return suiteRoot;
  };

  return exports;
};


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
