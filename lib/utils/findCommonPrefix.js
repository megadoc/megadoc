/**
 * @namespace Core.Utils
 *
 * Given a list of strings, find the common substring they all start with.
 * Very useful for extracting relative paths from a list of paths.
 *
 * @param {String[]} array
 *        Your list of some-what related strings.
 *
 * @param {String} [delim=null]
 *        If specified, the prefix will span until the last occurrence of this
 *        delimiter, like a '/' in a file-path so that any common characters
 *        after that last '/' don't get trimmed.
 *
 * @return {String}
 *         The common prefix.
 */
module.exports = function(array, delim) {
  if (array.length === 0) {
    return '';
  }

  var A = array.slice(0).sort();
  var word1 = A[0];
  var word2 = A[A.length-1];
  var L = word1.length;
  var i = 0;
  var lastDelimiterIndex;

  while (i < L && word1.charAt(i) === word2.charAt(i)) {
    if (delim && word1.charAt(i) === delim) {
      lastDelimiterIndex = i;
    }

    i++;
  }

  return word1.substring(0, delim ? lastDelimiterIndex+1 : i);
};