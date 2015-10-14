var htmlToText = require('../../lib/utils/htmlToText');

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
          tag.string = md(
            linkify('['+tag.string.trim()+']()', moduleId),
            { trimHTML: true }
          );
        }

        tag.typeInfo.types = tag.typeInfo.types.map(function(type) {
          var typeStr = type;
          var isArray;

          if (type.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
            typeStr = RegExp.$1 || RegExp.$2;
            isArray = true;
          }

          var linkedStr = md(
            linkify('['+typeStr+']()', moduleId, { strict: false }),
            { trimHTML: true }
          );

          if (isArray) {
            linkedStr = 'Array&lt;' + linkedStr + '&gt;';
          }

          return linkedStr;
        });
      });
    }
  });
};