var htmlparser = require("htmlparser2");

/**
 * Strip HTML from a string and get some plain text.
 *
 * @param  {String} html
 *         A string containing HTML entities.
 *
 * @return {String}
 *         The string without any HTML entities.
 */
module.exports = function htmlToText(html) {
  var buf = '';
  var parser = new htmlparser.Parser({
    ontext: function(text){
      buf += text;
    }
  }, {decodeEntities: true});

  parser.write(html);

  return buf;
};