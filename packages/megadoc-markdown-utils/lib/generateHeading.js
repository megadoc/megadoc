const generateAnchor = require('./generateAnchor');
const htmlToText = require('./htmlToText');

module.exports = function generateHeading(html, level, previousSections = []) {
  const text = htmlToText(html)
  const id = generateAnchor(text);
  const conflictIndex = previousSections.filter(x => x.id === id).length;

  let scopedId;

  if (conflictIndex > 0) {
    scopedId = `${id}-${conflictIndex}`;
  }
  else {
    scopedId = id;
  }

  return { id, level, scopedId, html, text, }
}

