var findWhere = require('lodash').findWhere;

function lookup(database, id) {
  return findWhere(database, { id: id });
}

function lookupModuleEntity(database, moduleId, entityName) {
  var entities = database.filter(function(doc) {
    return doc.receiver === moduleId;
  });

  var entity = findWhere(entities, { name: entityName });

  // If we weren't able to look up the entity by name alone, there might be a
  // symbol in the beginning of the name, so we retry the lookup with that in
  // mind. For example: [#someMethod] or [@someProp].
  if (!entity) {
    var symbol = entityName.slice(0,1);
    var name = entityName.slice(1);

    entity = entities.filter(function(e) {
      return e.name === name && e.ctx.symbol === symbol;
    })[0];
  }

  return entity;
}

function getIndex(database, id, registry, currentModuleId) {
  var index = registry.get(id);

  if (index && index.type === 'cjs') {
    return index;
  }
  else if (currentModuleId) {
    var entity = lookupModuleEntity(database, currentModuleId, id);

    if (entity) {
      return getIndex(database, entity.path, registry);
    }
  }
}

function resolveLink(database, id, registry, currentModuleId) {
  var title, doc, parentDoc;

  // registry index, we'll need this to look up the proper doc(s)
  var index = getIndex(database, id, registry, currentModuleId);

  if (index) {
    doc = lookup(database, index.id);

    if (!doc) {
      return undefined;
    }

    // This is a link to a module entity, like [Module@propName] or
    // [Module#methodName]:
    if (index.parent) {
      parentDoc = lookup(database, index.parent);

      console.assert(!!parentDoc,
        "Expected to find a module doc by the id '" + index.parent + "'"
      );

      // if we are in the same module, just use the entity's name and its
      // symbol - no need for the full ID.
      if (currentModuleId === parentDoc.id) {
        title = doc.ctx.symbol + doc.name;
      }
      else {
        title = [ parentDoc.name, doc.name ].join(doc.ctx.symbol);
      }

      return {
        href: doc.href,
        title: title
      };
    }
    // a direct link to a module:
    else {
      return {
        href: doc.href,
        title: doc.name
      };
    }
  }
}

module.exports = resolveLink;