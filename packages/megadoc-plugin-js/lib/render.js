module.exports = function(compiler, namespaceNode, md, linkify) {
  namespaceNode.documents.forEach(visitNode);

  function visitNode(node) {
    if (node.properties) {
      renderNode(node);
    }

    if (node.entities) {
      node.entities.forEach(visitNode)
    }

    if (node.documents) {
      node.documents.forEach(visitNode)
    }
  }

  function renderNode(node) {
    var doc = node.properties;

    if (doc.description) {
      doc.description = md(linkify({
        text: doc.description,
        contextNode: node,
      }));
    }

    if (doc.mixinTargets) {
      doc.mixinTargets = doc.mixinTargets.map(function(typeName) {
        var target = compiler.corpus.resolve({
          text: typeName,
          contextNode: node
        });

        if (!target) {
          return { name: typeName };
        }

        return {
          uid: target.uid,
          name: typeName,
          html: compiler.linkResolver.renderLink({
            strict: true,
            format: 'html',
            contextNode: node,
          }, {
            path: typeName,
            text: typeName,
            source: typeName
          })
        };
      });
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
              strict: false
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