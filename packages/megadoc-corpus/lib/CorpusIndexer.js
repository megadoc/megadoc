var invariant = require('invariant');

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
      if (node.filePath) {
        indices[ensureLeadingSlash(node.filePath)] = 1;
      }
    }
    else {
      var fieldName = field[0] === '$' ? field.slice(1) : field;
      var valuePool = field[0] === '$' ? node : node.properties;

      if (valuePool && valuePool.hasOwnProperty(fieldName)) {
        var values = [].concat(valuePool[fieldName]);

        values.forEach(function(index) {
          invariant(typeof index === 'string',
            "Index field must be a string, not '" + typeof index + "'. " +
            "Source:" + node.uid + '[' + field + ']'
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

  do {
    if (anchorNode.type === 'Namespace') {
      break;
    }

    ancestors.unshift(anchorNode);

    map[ancestors.map(identifyNode).join('')] = ancestors.length - 1;
  } while ((anchorNode = anchorNode.parentNode));

  function identifyNode(x, i) {
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

function ensureLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}
