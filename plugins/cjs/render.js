var htmlToText = require('html-to-text');

function trimHTML(html) {
  return html.replace('<p>', '').replace('</p>', '').trim();
}

module.exports = function(database, md, linkify) {
  database.forEach(function(doc) {
    var moduleId = doc.isModule ? doc.id : doc.receiver;

    if (doc.description) {
      doc.summary = htmlToText.fromString(
        md(doc.description.split('\n')[0].substr(0, 120))
      );

      doc.description = md(linkify(doc.description, moduleId));
    }

    if (doc.tags) {
      doc.tags.forEach(function(tag) {
        if (tag.typeInfo.description) {
          tag.typeInfo.description = md(linkify(tag.typeInfo.description, moduleId));
        }

        if (tag.type === 'example') {
          tag.string = md(linkify(tag.string, moduleId));
        }

        else if (tag.type === 'see') {
          tag.string = trimHTML(
            md(
              linkify('['+tag.string.trim()+']()', moduleId)
            )
          );
        }

        tag.typeInfo.types = tag.typeInfo.types.map(function(type) {
          return trimHTML(md(linkify('['+type+']()', moduleId, false)));
        });

        // TODO: linkify the types in @return, @param, etc.
      });
    }
  });
};