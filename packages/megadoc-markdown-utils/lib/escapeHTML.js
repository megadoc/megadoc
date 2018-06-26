const AMP_RE_ = /&/g;
const LT_RE_ = /</g;
const GT_RE_ = />/g;
const QUOT_RE_ = /"/g;
const SINGLE_QUOTE_RE_ = /'/g;
const NULL_RE_ = /\x00/g;

module.exports = function escapeHTML(htmlString) {
  return htmlString.replace(AMP_RE_, '&amp;')
    .replace(LT_RE_, '&lt;')
    .replace(GT_RE_, '&gt;')
    .replace(QUOT_RE_, '&quot;')
    .replace(SINGLE_QUOTE_RE_, '&#39;')
    .replace(NULL_RE_, '&#0;')
  ;
}