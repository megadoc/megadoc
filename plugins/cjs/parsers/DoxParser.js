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
  if (doc.isClass || doc.isConstructor) {
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

// function isConstructor(doc, classDoc) {
//   return doc.ctx.name === classDoc.ctx.name && (
//     doc.ctx.type === 'declaration' ||
//     doc.ctx.type === 'function'
//   );
// }

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

function isMethodStatic(doc, currentModule) {
  if (findWhere(doc.tags, { type: 'static' })) {
    return true;
  }
  else if (doc.ctx.string === currentModule.ctx.name + '.' + doc.ctx.name + '()') {
    return true;
  }
}

function isFunction(doc) {
  return doc.ctx.type === 'function';
}

function isMethod(doc) {
  return doc.ctx.type === 'method' || doc.ctx.type === 'function';
}

function isProperty(doc) {
  return doc.ctx.type === 'property';
}

function isModuleExports(doc) {
  return doc.ctx.receiver === 'module' && doc.ctx.string === 'module.exports()';
}

function generateSymbol(doc) {
  if (doc.isStatic) {
    return '.';
  }
  else if (isMethod(doc)) {
    return '#';
  }
  else if (isProperty(doc)) {
    return '@';
  }
  else {
    return '';
  }
}

function findReferences(doc, docs) {
  return docs.filter(function(ref) {
    return ref.ctx.receiver === doc.id;
  });
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

  var validDocs = docs
    .filter(function(doc) {
      return (isModule(doc) || !!doc.ctx) && !doc.tags.some(function(tag) {
        return tag.type === 'internal';
      });
    })
    .filter(function(doc) {
      return !isDocEmpty(doc);
    })
  ;

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
      doc.namespace = inferModuleNamespace(doc, useDirAsNamespace ? filePath : null);
      doc.ctx.name = doc.id.replace(/^[\w_]+\./, ''); // discard namespace from name

      if (doc.ctx.name.length === 0) {
        console.warn(
          "The module found at the source below must be named manually and will",
          "be ignored until this is corrected.",
          "Source:", doc.filePath + ':' + doc.line
        );
      }

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
      if (currentModule) {
        // handle exports.* which were preceded by some @class identifier
        if (!doc.ctx.receiver || doc.ctx.receiver === 'exports') {
          doc.ctx.receiver = currentModule.id;
        }

        // make sure the receiver points to the FQN of the currentModule
        if (doc.ctx.receiver === currentModule.ctx.name) {
          doc.ctx.receiver = currentModule.id;
        }

        if (isMethodStatic(doc, currentModule)) {
          doc.isStatic = true;
        }
      }

      // try to infer an ID
      if (doc.ctx.receiver) {
        doc.id = doc.ctx.receiver + '.' + doc.ctx.name;
      }
      else {
        doc.id = doc.ctx.name;
      }
    }

    doc.name = doc.ctx.name;
    doc.symbol = generateSymbol(doc, currentModule);
    doc.tags.forEach(decorateTag.bind(null, doc));

    // if (doc.symbol.length) {
    //   doc.id = doc.id.replace('.', doc.symbol);
    // }

    discardUnwantedTags(doc);

    if (doc.$descriptionFragments.length > 0) {
      doc.$descriptionFragments.unshift(doc.description.full);
      doc.description.full = doc.$descriptionFragments.join('');
    }

    removeExtraneousClassIdFromOfDescription(doc);

    delete doc.$descriptionFragments;
  });

  return validDocs;
}

exports.parseFile = function(filePath, config) {
  return parse(
    fs.readFileSync(filePath, 'utf-8'),
    filePath,
    config.useDirAsNamespace,
    config.classifyDoc
  );
};

exports.postProcess = function(docs) {
  docs
    .filter(function(doc) {
      return isFunction(doc) || isModuleExports(doc);
    })
    .forEach(function(doc) {
      var references = findReferences(doc, docs);
      if (references.length === 0) {
        doc.isFunction = true;

        if (isModuleExports(doc)) {
          // don't consider module.exports = function() a member method
          doc.ctx.type = 'function';

          if (doc.ctx.name === 'exports') {
            console.warn(
              "You should manually name this exported function using a @module tag.",
              "Source: " + doc.filePath + ':' + doc.line
            );
          }
        }
      }
    })
  ;

  docs.forEach(function(doc) {
    delete doc.code;
    delete doc.codeStart;
    delete doc.line;
  });
};
