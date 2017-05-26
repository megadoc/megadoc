const invariant = require('invariant');
const { dumpNodeFilePath } = require('./CorpusUtils');
const { curry } = require('lodash');

// An index of value 0 is considered private and is accessible only to the node
// and its "friends". Indices of higher values are not significant in their
// value and merely denote that they are visible to all nodes.
module.exports = curry(function buildIndices(corpus, node) {
  if (node.type === 'Namespace') {
    return {};
  }

  var indexFields = resolveIndexFields(corpus, node) || [];

  return indexFields.reduce(function(indices, field) {
    if (field === '$uid' || field === '$path') {
      generateIdIndices(corpus, node, indices);
    }
    else if (field === '$filePath') {
      var filePathIndex = getFilePathIndex(corpus, node);

      if (filePathIndex) {
        indices[withLeadingSlash(filePathIndex)] = 1;
        indices[withoutLeadingSlash(filePathIndex)] = 1;
      }
    }
    else {
      var fieldName = field[0] === '$' ? field.slice(1) : field;
      var valuePool = field[0] === '$' ? node : node.properties;

      if (valuePool && valuePool[fieldName]) {
        var values = [].concat(valuePool[fieldName]);

        values.forEach(function(index) {
          invariant(typeof index === 'string',
            dumpNodeFilePath(node) + '[' + field + ']: ' +
            "Index field must be a string, not '" + typeof index + "'. "
          );

          indices[index] = 1;
        });
      }
    }

    return indices;
  }, {});
})

function generateIdIndices(corpus, node, map) {
  var ancestors = [];
  var anchorNode = node;
  const parentNode = corpus.getParentOf(node);
  var isTopLevel = parentNode && parentNode.type === 'Namespace';

  // If the node resides at the top level of its namespace, it will have only
  // one UID index and that *should* be public.
  if (isTopLevel) {
    map[node.id] = 1;
  }
  else {
    do {
      if (anchorNode.type === 'Namespace') {
        break;
      }

      ancestors.unshift(anchorNode);

      map[ancestors.map(identifyNodeInChain).join('')] = ancestors.length - 1;
    } while ((anchorNode = corpus.getParentOf(anchorNode)));
  }

  function identifyNodeInChain(x, i) {
    if (i > 0) {
      return (ancestors[i-1].symbol || '') + x.id;
    }
    else {
      return x.id;
    }
  }

  return map;
}

function resolveIndexFields(corpus, node) {
  if (!node) {
    return null;
  }
  else if (node.indexFields) {
    return node.indexFields;
  }
  else {
    return resolveIndexFields(corpus, corpus.getParentOf(node));
  }
}

function withLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}

function withoutLeadingSlash(x) {
  return x[0] === '/' ? x.slice(1) : x;
}

function buildEntityFileIndex(corpus, node) {
  const parentNode = corpus.getParentOf(node);

  return (
    (node.filePath || parentNode.filePath) +
    (parentNode.symbol || '') +
    node.id
  );
}

function getFilePathIndex(corpus, node) {
  // for entities, we want to index by the enclosing document's filepath
  // followed by the id of the entity for links like:
  //
  //     /README.md#see-something
  //     /lib/X.js@name
  if (node.type === 'DocumentEntity') {
    if (node.filePath || corpus.getParentOf(node).filePath) {
      return buildEntityFileIndex(corpus, node);
    }
  }
  else if (node.filePath) {
    return node.filePath;
  }
}