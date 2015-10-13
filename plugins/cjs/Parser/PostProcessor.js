var K = require('./constants');
var DocClassifier = require('./DocClassifier');
var Utils = require('./Utils');
var Logger = require('../../../lib/Logger');
var console = new Logger('cjs');

exports.run = function(registry) {
  var docs = registry.docs;
  var initialCount = docs.length;

  console.debug('Post-processing %d docs.', docs.length);

  docs.filter(DocClassifier.isEntity).forEach(function(doc) {
    resolveReceiver(registry, doc);
  });

  removeBadDocs(registry);

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

  console.debug('Post-processing complete. %d/%d docs remain.', docs.length, initialCount);
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
    Utils.isFactoryModuleReturnEntity(
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
    doc.overrideReceiver(receiver);
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
    var ctx = doc.nodeInfo.ctx;

    if (!ctx.type || ctx.type === K.TYPE_UNKNOWN) {
      console.warn(
        'Entity "%s" has no context. This probably means tinydoc does not know ' +
        'how to handle it yet. (Source: %s)',
        doc.id,
        doc.nodeInfo.fileLoc
      );
    }
  });
}