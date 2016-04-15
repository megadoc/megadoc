var RendererUtils = require('tinydoc/lib/Renderer/Utils');

module.exports = function(database, md, linkify) {
  database.forEach(function(doc) {
    var moduleId = doc.isModule ? doc.id : doc.receiver;
    var linkSource = { href: doc.href, title: doc.id };

    if (doc.description) {
      doc.summary = RendererUtils.sanitize(
        RendererUtils.extractSummary(doc.description)
      );

      doc.description = md(linkify({
        text: doc.description,
        context: moduleId,
        source: linkSource,
      }));
    }

    if (doc.tags) {
      doc.tags.forEach(function(tag) {
        if (tag.typeInfo.description) {
          tag.typeInfo.description = md(linkify({
            text: tag.typeInfo.description,
            context: moduleId,
            source: linkSource,
          }));
        }

        if (tag.type === 'example') {
          tag.string = md(linkify({
            text: tag.string,
            context: moduleId,
            source: linkSource,
          }));
        }

        else if (tag.type === 'see') {
          tag.string = md(
            linkify({
              text: '['+tag.string.trim()+']()',
              context: moduleId,
              source: linkSource,
            }),
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
            linkify({
              text: '['+typeStr+']()',
              context: moduleId,
              source: linkSource,
              options: { strict: false }
            }),
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