const normalizeHeading = require('./normalizeHeading');
const htmlToText = require('./htmlToText');

module.exports = function generateAnchor(text) {
  return normalizeHeading(
    htmlToText(text.split('\n')[0])
  );
};
