const R = require('ramda');
const chalk = require('chalk')
const RE_SURROUNDING_NEWLINES = /^\n+|\n\s*$/g;

/**
 * @type {Function}
 *
 * Make some text bold!
 *
 * @param {String}
 * @return {String}
 */
exports.bold = chalk.bold;

/**
 * @type {Function}
 *
 * Underline some text.
 *
 * @param {String}
 * @return {String}
 */
exports.underline = chalk.underline;

exports.color = chalk;

exports.nws = function(src) {
  const lines = src.split('\n')
  const notBlank = x => /\S/.test(x);
  const firstFilledLine = R.find(notBlank, lines);

  if (!firstFilledLine) {
    return src;
  }

  const indentSize = firstFilledLine.match(/\S/).index;
  const indent = Array(indentSize).fill(' ').join('');
  const startsWithIndent = R.startsWith(indent);

  if (!lines.filter(notBlank).every(startsWithIndent)) {
    return src;
  }

  return src
    .replace(new RegExp(`(^|\n)[ ]{${indentSize}}`, 'g'), '$1')
    .replace(RE_SURROUNDING_NEWLINES, '')
  ;
};

exports.pad = R.curry(function pad(paddingSize, string) {
  const padding = Array(paddingSize + 1).join(' ')
  return string.split('\n').map(x => `${padding}${x}`).join('\n')
})
