/**
 * @module
 *
 * Strip an HTML block of a surrounding `<p></p>`.
 *
 * @param  {String} html
 * @return {String}
 */
function trimHTML(html) {
  return html.replace('<p>', '').replace('</p>', '').trim();
}

module.exports = trimHTML;