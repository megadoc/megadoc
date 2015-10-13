var htmlToText = require('../../lib/utils/htmlToText');

function trimHTML(html) {
  return html.replace('<p>', '').replace('</p>', '').trim();
}

module.exports = function(database, md, linkify) {
  database.forEach(function(doc) {
    var moduleId = doc.isModule ? doc.id : doc.receiver;

    if (doc.description) {
      doc.summary = htmlToText(
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
          var typeStr = type;
          var isArray;

          if (type.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
            typeStr = RegExp.$1 || RegExp.$2;
            isArray = true;
          }

          var linkedStr = trimHTML(md(linkify('['+typeStr+']()', moduleId, false)));

          if (isArray) {
            linkedStr = 'Array&lt;' + linkedStr + '&gt;';
          }

          return linkedStr;
        });
      });
    }
  });
};