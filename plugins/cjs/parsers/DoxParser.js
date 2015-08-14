var dox = require('dox');
var fs = require('fs');
var path = require('path');
var Logger = require('../../../lib/Logger');
var strClassify = require('../../../lib/utils/strClassify');
var console = new Logger('cjs');
var extend = require('lodash').extend;

var DoxParser;
var NO_DESCRIPTION_TAGS = [
  'memberOf',
  'constructor',
  'class',
  'extends',
  'private',
  'mixin',
  'module'
];

function isClass(doc) {
  if (doc.isClass || doc.isConstructor || (doc.ctx && doc.ctx.type === 'function')) {
    return true;
  }
  else if (doc.ctx &&
    doc.ctx.receiver === 'module' &&
    doc.ctx.name === 'exports'
  ) {
    return true;
  }

  return doc.tags.some(function(tag) {
    return (
      tag.isConstructor ||
      tag.type === 'class' ||
      tag.type === 'module' ||
      tag.type === 'namespace'
    );
  });
}

function isConstructor(doc, classDoc) {
  return (
    doc.ctx.type === 'declaration' ||
    doc.ctx.type === 'function'
  ) && doc.ctx.name === classDoc.ctx.name;
}

function inferClassId(doc) {
  var classTag = doc.tags.filter(function(tag) {
    return [ 'class', 'module', 'namespace' ].indexOf(tag.type) > -1;
  })[0];

  var nameMatch;

  if (classTag) {
    nameMatch = classTag.string.match(/^(\w+)\s*$|(\w+)\s*\n/);
  }

  if (nameMatch) {
    return nameMatch[1] || nameMatch[2];
  }
  else if (doc.ctx && doc.ctx.name === 'exports') {
    return strClassify(path.basename(doc.filePath, path.extname(doc.filePath)));
  }
  else if (doc.ctx && doc.ctx.type === 'declaration') {
    return doc.ctx.string;
  }
  else if (doc.ctx && doc.ctx.name) {
    return doc.ctx.name;
  }
  else {
    console.warn('Unable to infer an ID for module:' + doc.filePath);
  }
}

function removeExtraneousClassIdFromOfDescription(doc) {
  var replacer = new RegExp('^' + doc.id + '\\s*\\n');
  doc.description.full = doc.description.full.replace(replacer, '');
}

function decorateTag(tag, doc) {
  var tagType = tag.type;

  // discard things we're not using
  delete tag.nullable;
  delete tag.nonNullable;
  delete tag.variable;
  delete tag.typesDescription;

  switch(tagType) {
    case 'property':
      extend(tag, DoxParser.parseProperty(tag.string));
    break;
  }

  // attach IDs
  switch(tagType) {
    case 'property':
      tag.id = tag.name;
    break;
  }


  // Extract class description; sometimes it's kept in description.full,
  // other times it's swalloed inside a tag of type "class" or "constructor"
  if (NO_DESCRIPTION_TAGS.indexOf(tagType) > -1) {
    var desc = tag.string;

    // memberOf has a @parent property which is the target class name, but
    // this name will be present in the description (@string) so we remove it:
    if (tag.parent) {
      desc = desc.replace(tag.parent, '');
    }

    doc.description.fragments.push(desc.replace(/^\n/, ''));
  }

  return tag;
}

DoxParser = function() {
  this._class = null;
};

DoxParser.prototype.parse = function(filePath) {
  return this.parseString(fs.readFileSync(filePath, 'utf-8'), filePath);
};

DoxParser.prototype.parseString = function(sourceCode, filePath) {
  var docs;

  try {
    docs = dox.parseComments(sourceCode, {
      skipSingleStar: true,
      raw: true
    });
  }
  catch(e) {
    if (e.name.match(/SyntaxError/)) {
      console.warn('A syntax error was raised trying to parse the file:', filePath);
      return [];
    }
    else {
      throw e;
    }
  }

  var context = this;

  var validDocs = docs.filter(function(doc) {
    doc.filePath = filePath;

    if (isClass(doc)) {
      if (!doc.ctx) {
        doc.ctx = {};
      }

      doc.id = doc.ctx.name = inferClassId(doc);
      doc.isClass = true;

      context._class = doc;
    }
    else {
      if (!doc.ctx) {
        console.warn('Doc is missing context!', filePath);

        if (context._class) {
          doc.ctx = {
            receiver: context._class.id,
            name: ''
          };

        }
        else {
          return false;
        }
      }

      // handle exports.* which were preceded by a @class identifier
      if (context._class && (!doc.ctx.receiver || doc.ctx.receiver === 'exports')) {
        doc.ctx.receiver = context._class.id;
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

    if (context._class) {
      if (!doc.isConstructor && isConstructor(doc, context._class)) {
        console.log("Corrected %s to have @isConstructor = true", doc.id);
        doc.isConstructor = true;
      }
    }

    doc.description.fragments = [];

    doc.tags.forEach(function(tag) {
      decorateTag(tag, doc);
    });

    if (doc.description.fragments.length > 0) {
      doc.description.fragments.unshift(doc.description.full);
      doc.description.full = doc.description.fragments.join('');
    }

    removeExtraneousClassIdFromOfDescription(doc);

    return true;
  });

  this.reset();

  return validDocs;
};

DoxParser.prototype.reset = function() {
  this._class = null;
};

DoxParser.parseProperty = function(docstring) {
  var info = {};
  var parsed = ''+docstring.trim();
  var matcher = parsed.match(/{([^}]+)}/);

  if (matcher) {
    parsed = parsed.substr(matcher[0].length).trim();
    info.types = matcher[1].trim().split(',');
  }

  if (parsed[0] === '[') {
    var lastBracketIndex = parsed.split('\n')[0].lastIndexOf(']');

    info.name = parsed.substr(1, lastBracketIndex-1);
    info.optional = true;

    parsed = parsed.substr(info.name.length+2);

    matcher = info.name.match(/([^=]+)=(.+)/);

    if (matcher) {
      info.defaultValue = matcher[2];
      info.name = matcher[1];
    }
  }
  else {
    matcher = parsed.match(/([\S]+)/);
    info.name = matcher[1];
    info.defaultValue = null;
    parsed = parsed.substr(matcher[0].length).trim();
  }

  info.description = parsed;

  return info;
};

module.exports = DoxParser;