var path = require('path');
var K = require('./constants');
var DocClassifier = require('./DocClassifier');
var ASTUtils = require('./ASTUtils');
var DocUtils = require('./DocUtils');
var debuglog = require('megadoc/lib/Logger')('megadoc').info;

exports.run = function(registry, config) {
  var docs = registry.docs;
  var initialCount = docs.length;

  debuglog('Post-processing %d docs.', docs.length);

  if (config.namespaceDirMap) {
    var namespaceDirMap = Object.keys(config.namespaceDirMap);

    docs.filter(DocClassifier.isModule).forEach(function(doc) {
      var docstring = doc.docstring;
      var filePath = doc.filePath;

      if (!docstring.namespace) {
        var dirName = path.dirname(filePath);

        namespaceDirMap.some(function(pattern) {
          if (dirName.match(pattern)) {
            // gotta <3 mutable state.. :)
            docstring.overrideNamespace(config.namespaceDirMap[pattern]);
            doc.id = doc.generateId();
            doc.name = doc.generateName();

            return true;
          }
        });
      }
    });
  }

  // docs.filter(DocClassifier.isEntity).forEach(function(doc) {
  //   resolveReceiver(registry, doc);
  // });

  // removeBadDocs(registry);

  docs.filter(DocClassifier.isEntity).forEach(function(doc) {
    identifyScope(registry, doc);
  });

  // Remove @lends docs, we don't need them.
  docs
    .filter(function(doc) { return doc.docstring.doesLend(); })
    .forEach(function(doc) {
      registry.remove(doc);
    })
  ;

  warnAboutUnknownContexts(registry);

  debuglog('Post-processing complete. %d/%d docs remain.', docs.length, initialCount);
};

function identifyScope(registry, doc) {
  var nodeInfo = doc.nodeInfo;

  if (nodeInfo.isInstanceEntity()) {
    nodeInfo.ctx.scope = K.SCOPE_INSTANCE;
  }
  else if (nodeInfo.isPrototypeEntity()) {
    nodeInfo.ctx.scope = K.SCOPE_PROTOTYPE;
  }
  else if (
    ASTUtils.isFactoryModuleReturnEntity(
      doc.$path.node,
      doc.$path,
      registry
    )
  ) {
    nodeInfo.ctx.scope = K.SCOPE_FACTORY_EXPORTS;
  }
}

function resolveReceiver(registry, doc) {
  var receiver = doc.nodeInfo.receiver;
  var actualReceiver;

  // @memberOf support
  //
  // Note that this might still need alias-resolving.
  if (doc.docstring.hasMemberOf()) {
    receiver = doc.docstring.getExplicitReceiver();

    if (receiver.match(/(.*)\.prototype$/)) {
      doc.overrideReceiver(RegExp.$1);

      doc.nodeInfo.addContextInfo({
        scope: K.SCOPE_PROTOTYPE
      });

      // For something like:
      //
      //     Object.defineProperty(someObj, 'someProp', {
      //       /** @memberOf someObj */
      //       get: function() {
      //       }
      //     })
      //
      // we don't want the context type to be function, because it isn't
      if (doc.docstring.hasTag('property')) {
        doc.nodeInfo.addContextInfo({
          type: K.TYPE_UNKNOWN
        });
      }
    }
    else {
      doc.overrideReceiver(receiver);
    }
  }

  // Resolve @lends
  var lendEntry = (
    registry.findAliasedLendTarget(doc.$path, receiver) ||
    registry.findClosestLend(doc.$path)
  );

  // TODO: this needs a bit of rethinking really
  if (lendEntry) {
    actualReceiver = registry.get(lendEntry.receiver);

    if (actualReceiver) {
      doc.overrideReceiver(actualReceiver.id);

      if (lendEntry.scope) {
        doc.nodeInfo.ctx.scope = lendEntry.scope;
      }
    }
  }
  else {
    //     var Something = exports;
    //         ^^^^^^^^^
    //
    //     // ...
    //
    //     /** yep */
    //     exports.something = function() {}
    //     ^^^^^^^
    if (receiver === 'exports') {
      actualReceiver = registry.findExportedModule(doc.filePath);

      if (actualReceiver) {
        doc.overrideReceiver(actualReceiver.id);
      }
    }
    else {
      // TODO: this too
      actualReceiver = (
        registry.findAliasedReceiver(doc.$path, receiver) ||
        registry.findClosestModule(doc.$path)
      );

      if (actualReceiver) {
        doc.overrideReceiver(actualReceiver);
      }
    }
  }
}

function removeBadDocs(registry) {
  var badDocs = [];

  registry.docs
    .filter(function(doc) {
      return (
        !doc.isModule() &&
        (!doc.hasReceiver() || !registry.get(doc.getReceiver()))
      );
    })
    .forEach(function(doc) {
      console.warn(
        'Unable to map "%s" to any module, it will be discarded. (Source: %s)',
        doc.id,
        doc.nodeInfo.fileLoc
      );

      badDocs.push(doc);
    })
  ;

  badDocs.forEach(function(doc) {
    registry.remove(doc);
  });

  badDocs = null;
}

function warnAboutUnknownContexts(registry) {
  registry.docs.forEach(function(doc) {
    if (DocUtils.getTypeOf(doc) === K.TYPE_UNKNOWN) {
      debuglog(
        'Entity "%s" has no context. This probably means megadoc does not know ' +
        'how to handle it yet. (Source: %s)',
        doc.id,
        doc.nodeInfo.fileLoc
      );
    }
  });
}