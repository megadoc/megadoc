var K = require('./constants');

exports.getIdOf = function(doc) {
  var name = doc.docstring.name || doc.nodeInfo.id;
  var namespace = doc.docstring.namespace;

  if (name && namespace) {
    return namespace + K.NAMESPACE_SEP + name;
  }
  else {
    return name;
  }
};

exports.getNameOf = function(doc) {
  return doc.docstring.name || doc.nodeInfo.id;
};

exports.getTypeOf = function(doc) {
  if (doc.docstring.hasTypeOverride()) {
    return doc.docstring.getTypeOverride();
  }
  else if (doc.nodeInfo.ctx.type) {
    return doc.nodeInfo.ctx.type;
  }

  return K.TYPE_UNKNOWN;
};

exports.getTypeNameOf = function(doc) {
  var type = exports.getTypeOf(doc);

  return type.name || type;
};

exports.isOfType = function(doc, expectedTypeName) {
  var typeName = exports.getTypeNameOf(doc);

  return typeName === expectedTypeName;
};

exports.isModule = function(doc) {
  return !doc.docstring.hasMemberOf() && (
    doc.isExported() ||
    doc.docstring.isModule() ||
    doc.nodeInfo.isModule()
  );
};

exports.getReceiverAndScopeFor = function(doc, registry) {
  var receiver = doc.nodeInfo.receiver;
  var correctedScope, exportedModule, enclosingModule, receivingModule;

  // Resolve @memberOf receiver aliasing:
  if (doc.docstring.hasMemberOf()) {
    receiver = doc.docstring.getExplicitReceiver();
  }

  // Resolve @lends using either the original receiver or the one pointed to
  // by @memberOf:
  var lendEntry = (
    registry.findAliasedLendTarget(doc.$path, receiver) ||
    registry.findClosestLend(doc.$path)
  );

  // TODO: this needs a bit of rethinking really
  if (lendEntry) {
    receiver = lendEntry.receiver;
  }
  // CommonJS specific scenario; the entity is attached to the special "exports"
  // variable.
  //
  // We need to watch out and not confuse it with "exports" Identifier nodes
  // that are not defined in the global Program scope.
  //
  //     var Something = exports;
  //         ^^^^^^^^^
  //
  //     // ...
  //
  //     /** yep */
  //     exports.something = function() {}
  //     ^^^^^^^
  else if (receiver === 'exports') {
    exportedModule = registry.findExportedModule(doc.filePath);

    if (exportedModule) {
      console.log('Correcting receiver from "exports" to "%s". Source: %s',
        exportedModule.id,
        exports.getLocationOf(doc)
      );

      receiver = exportedModule.id;
    }
  }
  else {
    // TODO: this too
    enclosingModule = (
      // registry.findAliasedReceiver(receiver) ||
      registry.findClosestModule(doc.$path)
    );

    if (enclosingModule) {
      receiver = enclosingModule;
    }
  }

  if (receiver) {
    if (receiver.match(/(.*)\.prototype$/)) {
      receiver = RegExp.$1;
      correctedScope = K.SCOPE_PROTOTYPE;
    }

    // Now search the Registry for a module that either has an ID or a name with
    // our resolved receiver string:
    receivingModule = registry.get(receiver);

    if (receivingModule) {
      receiver = receivingModule.id;
    }
  }

  if (!receiver) {
    console.warn(
      "No receiver was found for the document '%s', it will be discarded.",
      exports.getLocationOf(doc)
    );
  }

  return { receiver: receiver, scope: correctedScope };
};

exports.getLocationOf = function(doc) {
  return (
    (doc.id || '<<unknown>>') + ' in ' +
    doc.filePath + ':' + doc.nodeInfo.loc.start.line
  );
};