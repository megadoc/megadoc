const htmlparser = require("htmlparser2");

/**
 * @module
 *
 * Strip HTML from a string and get some plain text.
 *
 * @param  {String} html
 *         A string containing HTML entities.
 *
 * @return {String}
 *         The string without any HTML entities.
 */
function htmlToText(html) {
  let buf = '';
  const parser = new htmlparser.Parser({
    ontext: function(text){
      buf += text;
    }
  }, {decodeEntities: true});

  parser.write(html);

  return buf;
}

module.exports = htmlToText;
