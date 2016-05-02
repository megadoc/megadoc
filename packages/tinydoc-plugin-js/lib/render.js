var RendererUtils = require('tinydoc/lib/RendererUtils');

module.exports = function(namespaceNode, md, linkify) {
  namespaceNode.documents.forEach(visitNode);

  function visitNode(node) {

    if (node.properties) {
      if (node.properties.description) {
        node.summary = RendererUtils.extractSummary(node.properties.description, {
          plainText: true
        });
      }

      renderDocument(node);
    }

    if (node.entities) {
      node.entities.forEach(visitNode)
    }

    if (node.documents) {
      node.documents.forEach(visitNode)
    }
  }

  function renderDocument(node) {
    var doc = node.properties;

    if (doc.description) {
      doc.description = md(linkify({
        text: doc.description,
        contextNode: node,
      }));
    }

    if (doc.tags) {
      doc.tags.forEach(function(tag) {
        if (tag.typeInfo.description) {
          tag.typeInfo.description = md(linkify({
            text: tag.typeInfo.description,
            contextNode: node,
          }));
        }

        if (tag.type === 'example') {
          tag.string = md(linkify({
            text: tag.string,
            contextNode: node,
          }));
        }

        else if (tag.type === 'see') {
          tag.string = md(
            linkify({
              text: '['+tag.string.trim()+']()',
              contextNode: node,
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
              contextNode: node,
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

  }
};