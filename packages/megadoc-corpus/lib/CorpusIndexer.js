var invariant = require('invariant');
var dumpNodeFilePath = require('./CorpusUtils').dumpNodeFilePath;

// An index of value 0 is considered private and is accessible only to the node
// and its "friends". Indices of higher values are not significant in their
// value and merely denote that they are visible to all nodes.
module.exports = function buildIndices(node) {
  if (node.type === 'Namespace') {
    return {};
  }

  var indexFields = resolveIndexFields(node) || [];

  return indexFields.reduce(function(indices, field) {
    if (field === '$uid') {
      generateIdIndices(node, indices);
    }
    else if (field === '$filePath') {
      var filePathIndex = getFilePathIndex(node);

      if (filePathIndex) {
        indices[withLeadingSlash(filePathIndex)] = 1;
        indices[withoutLeadingSlash(filePathIndex)] = 1;
      }
    }
    else {
      var fieldName = field[0] === '$' ? field.slice(1) : field;
      var valuePool = field[0] === '$' ? node : node.properties;

      if (valuePool && valuePool.hasOwnProperty(fieldName)) {
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
}

function generateIdIndices(node, map) {
  var ancestors = [];
  var anchorNode = node;
  var isTopLevel = node.parentNode && node.parentNode.type === 'Namespace';

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
    } while ((anchorNode = anchorNode.parentNode));
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

function resolveIndexFields(node) {
  var anchorNode = node;

  do {
    if (anchorNode.indexFields) {
      return anchorNode.indexFields;
    }
  } while ((anchorNode = anchorNode.parentNode));
}

function withLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}

function withoutLeadingSlash(x) {
  return x[0] === '/' ? x.slice(1) : x;
}

function buildEntityFileIndex(node) {
  return (
    (node.filePath || node.parentNode.filePath) +
    (node.parentNode.symbol || '') +
    node.id
  );
}

function getFilePathIndex(node) {
  // for entities, we want to index by the enclosing document's filepath
  // followed by the id of the entity for links like:
  //
  //     /README.md#see-something
  //     /lib/X.js@name
  if (node.type === 'DocumentEntity') {
    if (node.filePath || node.parentNode.filePath) {
      return buildEntityFileIndex(node);
    }
  }
  else if (node.filePath) {
    return node.filePath;
  }
}