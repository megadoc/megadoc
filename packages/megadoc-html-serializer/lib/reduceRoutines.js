const RendererUtils = require('./render/RendererUtils');

exports.extractSummaryFromMarkdown = function extractSummaryFromMarkdown(markdown) {
  return RendererUtils.extractSummary(markdown || '', {
    plainText: true
  })
};