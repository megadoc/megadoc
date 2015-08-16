var dox = require('dox');
var fs = require('fs');
var Logger = require('../../../lib/Logger');
var console = new Logger('cjs');
var findWhere = require('lodash').findWhere;
var inferModuleId = require('./DoxParser/inferModuleId');
var inferModuleNamespace = require('./DoxParser/inferModuleNamespace');
var decorateTag = require('./DoxParser/decorateTag');

var DISCARDED_TAG_TYPES = [ 'namespace' ];

function isModule(doc) {
  var ctx = doc.ctx || {};

  if (doc.isClass || doc.isConstructor/* || (ctx.type === 'function') */) {
    return true;
  }
  else if (ctx.receiver === 'module' && ctx.name === 'exports') {
    return true;
  }
  else {
    return doc.tags.some(function(tag) {
      return (
        tag.isConstructor ||
        tag.type === 'class' ||
        tag.type === 'module'
      );
    });
  }
}

function isClass(doc) {
  if (doc.isClass || doc.isConstructor) {
    return true;
  }
  else {
    return doc.tags.some(function(tag) {
      return tag.isConstructor || tag.type === 'class';
    });
  }
}

function isConstructor(doc, classDoc) {
  return doc.ctx.name === classDoc.ctx.name && (
    doc.ctx.type === 'declaration' ||
    doc.ctx.type === 'function'
  );
}

function removeExtraneousClassIdFromOfDescription(doc) {
  var replacer = new RegExp('^' + doc.id + '\\s*\\n');
  doc.description.full = doc.description.full.replace(replacer, '');
}

function discardUnwantedTags(doc) {
  doc.tags = doc.tags.filter(function(tag) {
    return DISCARDED_TAG_TYPES.indexOf(tag.type) === -1;
  });
}

function isDocEmpty(doc) {
  return doc.tags.length === 0 && doc.description.full === '';
}

function parse(sourceCode, filePath, useDirAsNamespace, customClassify) {
  var docs;
  var currentModule;

  try {
    docs = dox.parseComments(sourceCode, {
      skipSingleStar: true,
      raw: true
    });
  }
  catch(e) {
    if (e.name.match(/SyntaxError/)) {
      console.warn('A syntax error was raised trying to parse the file:', filePath, e);
      return [];
    }
    else {
      throw e;
    }
  }

  var validDocs = docs.filter(function(doc) {
    return (isModule(doc) || !!doc.ctx) && !doc.tags.some(function(tag) {
      return tag.type === 'internal';
    });
  }).filter(function(doc) {
    return !isDocEmpty(doc);
  });

  validDocs.forEach(function(doc) {
    doc.$descriptionFragments = [];
    doc.filePath = filePath;

    if (!doc.ctx) {
      doc.ctx = {};
    }

    if (isModule(doc)) {
      doc.id = inferModuleId(doc, filePath);
      doc.isModule = true;
      doc.isClass = isClass(doc);
      doc.isMethod = !doc.isClass && ['method', 'function'].indexOf(doc.ctx.type) > -1;
      doc.ctx.name = doc.id.replace(/^[\w]+\./, ''); // discard namespace from name
      doc.namespace = inferModuleNamespace(doc, useDirAsNamespace ? filePath : null);

      if (doc.namespace) {
        doc.id = doc.namespace + '.' + doc.ctx.name;
      }

      if (customClassify) {
        customClassify(doc);
      }

      // if there was a @namespace tag with some description of the module below
      // it, it would "consume" that description so we need to rewrite it to
      // the module's doc. Example docstring:
      //
      //     /**
      //      * @namespace Core
      //      *
      //      * My module description.
      //      */
      //      function MyModule() {}
      var nsTag = findWhere(doc.tags, { type: 'namespace' });

      if (nsTag) {
        var description = nsTag.string.split('\n').slice(1).join('\n');
        doc.$descriptionFragments.push(description);
      }

      currentModule = doc;
    }
    else {
      // handle exports.* which were preceded by some @class identifier
      if (currentModule && (!doc.ctx.receiver || doc.ctx.receiver === 'exports')) {
        doc.ctx.receiver = currentModule.id;
      }

      // try to infer an ID
      if (doc.ctx.receiver) {
        doc.path = doc.ctx.receiver + '.' + doc.ctx.name;
        doc.id = doc.ctx.name;
      }
      else {
        doc.id = doc.ctx.name;
      }
    }

    if (currentModule) {
      if (!doc.isConstructor && isConstructor(doc, currentModule)) {
        // doc.isConstructor = true;
      }
    }

    doc.tags.forEach(decorateTag.bind(null, doc));

    discardUnwantedTags(doc);

    if (doc.$descriptionFragments.length > 0) {
      doc.$descriptionFragments.unshift(doc.description.full);
      doc.description.full = doc.$descriptionFragments.join('');
    }

    removeExtraneousClassIdFromOfDescription(doc);

    delete doc.$descriptionFragments;
  });

  return validDocs;
};


module.exports = function parseFile(filePath, config) {
  return parse(
    fs.readFileSync(filePath, 'utf-8'),
    filePath,
    config.useDirAsNamespace,
    config.classifyDoc
  );
};