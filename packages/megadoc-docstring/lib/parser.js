var assert = require('assert');
var neutralizeWhitespace = require('./utils/neutralizeWhitespace');

function Parser() {
  this.factories = {}
}

Parser.FACTORIES = {};
Parser.FACTORIES['withName'] = function(rawTag) {
  var tag = {};
  var lines = rawTag.string.split('\n');

  tag.type = rawTag.type;
  tag.name = lines[0];
  tag.description = lines.slice(1).join('\n');

  return tag;
};

Parser.FACTORIES['withNameAndType'] = function(rawTag) {
  var tag = {};
  var lines = rawTag.string.split('\n');
  var typeInfo = {};

  var parts = exports.extractTagParts(lines[0]);
  var typeString = parts.shift();

  tag.type = rawTag.type;
  tag.name = parts[0] || '';
  tag.description = neutralizeWhitespace(lines.slice(1).join('\n'));

  exports.parseTagTypes(typeString, typeInfo);

  // TODO: should we be doing this here?
  if (tag.name.match(/\[([^\]]+)\]/)) {
    tag.name = RegExp.$1;
    typeInfo.optional = true;
  }

  if (typeInfo.optional && tag.name.match(/([^=]+)=(.+)/)) {
    tag.name = RegExp.$1;
    typeInfo.defaultValue = RegExp.$2;
  }

  tag.typeInfo = typeInfo;

  return tag;
};

Parser.prototype.defineTag = function(tagName, factory) {
  if (typeof factory === 'string') {
    factory = Parser.FACTORIES[factory];
  }

  assert(typeof factory === 'function', "Defining a tag requires a factory.");

  this.factories[tagName] = factory;
};


Parser.prototype.createTag = function(tag) {
  var factory = this.factories[tag.type];

  assert(factory, "Unknown tag '" + tag.type + "'");

  return factory(tag);
};

Parser.prototype.parseComment = function(str) {
  var docstring = exports.parseComment(str);
  docstring.tags = docstring.tags.map(this.createTag.bind(this));
  return docstring;
};

exports.Parser = Parser;

/**
 * Parse comments in the given string of `js`.
 *
 * @param {String} js
 * @param {Object} options
 * @return {Array}
 * @see exports.parseComment
 */

exports.parseComments = function(js, options){
  options = options || {};
  js = js.replace(/\r\n/gm, '\n');

  var comments = [];
  var skipSingleStar = options.skipSingleStar;
  var comment;
  var buf = '';
  var ignore;
  var withinMultiline = false;
  var withinSingle = false;
  var withinString = false;
  var linterPrefixes = options.skipPrefixes || ['jslint', 'jshint', 'eshint'];
  var skipPattern = new RegExp('^' + (options.raw ? '' : '<p>') + '('+ linterPrefixes.join('|') + ')');
  var lineNum = 1;
  var lineNumStarting = 1;

  for (var i = 0, len = js.length; i < len; ++i) {
    // start comment
    if (!withinMultiline && !withinSingle && !withinString &&
        '/' === js[i] && '*' === js[i+1] && (!skipSingleStar || js[i+2] === '*')) {
      lineNumStarting = lineNum;
      // code following the last comment
      if (buf.trim().length) {
        comment = comments[comments.length - 1];

        if (comment) {
          // Adjust codeStart for any vertical space between comment and code
          comment.codeStart += buf.match(/^(\s*)/)[0].split('\n').length - 1;
        }
        buf = '';
      }
      i += 2;
      withinMultiline = true;
      ignore = '!' === js[i];

      // if the current character isn't whitespace and isn't an ignored comment,
      // back up one character so we don't clip the contents
      if (' ' !== js[i] && '\n' !== js[i] && '\t' !== js[i] && '!' !== js[i]) i--;

    }
    // end comment
    else if (withinMultiline && !withinSingle && '*' === js[i] && '/' === js[i+1]) {
      i += 2;
      buf = buf.replace(/^[ \t]*\* ?/gm, '');
      comment = exports.parseComment(buf, options);
      comment.ignore = ignore;
      comment.line = lineNumStarting;
      comment.codeStart = lineNum + 1;
      if (!comment.description.full.match(skipPattern)) {
        comments.push(comment);
      }
      withinMultiline = ignore = false;
      buf = '';
    }
    else if (!withinSingle && !withinMultiline && !withinString && '/' === js[i] && '/' === js[i+1]) {
      withinSingle = true;
      buf += js[i];
    }
    else if (withinSingle && !withinMultiline && '\n' === js[i]) {
      withinSingle = false;
      buf += js[i];
    }
    else if (!withinSingle && !withinMultiline && ('\'' === js[i] || '"' === js[i])) {
      withinString = !withinString;
      buf += js[i];
    }
    else {
      buf += js[i];
    }

    if ('\n' === js[i]) {
      lineNum++;
    }
  }

  if (comments.length === 0) {
    comments.push({
      tags: [],
      description: {full: ''},
      line: lineNumStarting
    });
  }

  // trailing code
  if (buf.trim().length) {
    comment = comments[comments.length - 1];
  }

  return comments;
};

/**
 * Parse the given comment `str`.
 *
 * The comment object returned contains the following
 *
 *  - `tags`  array of tag objects
 *  - `description` the first line of the comment
 *
 * @param {String} str
 * @return {Object}
 */

exports.parseComment = function(str) {
  var comment = { tags: [] };
  var description = '';
  var tags = str.trim().split('\n@');

  // A comment has no description
  if (tags[0].charAt(0) === '@') {
    tags.unshift('');
  }

  // parse comment body
  description = String(tags[0]);
  comment.description = description;

  // parse tags
  if (tags.length) {
    comment.tags = tags.slice(1).map(exports.parseTag);

    if (!description || !description.trim()) {
      comment.tags.some(function(tag){
        if ('description' === tag.type) {
          description += tag.full;
          return true;
        }
      });
    }
  }

  return comment;
};

//TODO: Find a smarter way to do this
/**
 * Extracts different parts of a tag by splitting string into pieces separated
 * by whitespace. If the white spaces are somewhere between curly braces (which
 * is used to indicate param/return type in JSDoc) they will not be used to
 * split the string.
 *
 * This allows to specify jsdoc tags without the need to eliminate all white
 * spaces i.e. {number | string}
 *
 * @param {String} str
 *        The tag line as a string that needs to be split into parts
 *
 * @return {Array<String>}
 *         An array of strings containing the parts
 */

exports.extractTagParts = function(str) {
  var level = 0;
  var extract = '';
  var split = [];

  str.split('').forEach(function(c) {
    if (c.match(/\s/) && level === 0) {
      split.push(extract);
      extract = '';
    } else {
      if (c === '{') {
        level++;
      }
      else if (c === '}') {
        level--;
      }

      extract += c;
    }
  });

  split.push(extract);

  return split.filter(function(fragment) {
    return fragment.length > 0;
  });
};


/**
 * Parse tag string `@param {Array} name description` etc.
 *
 * @param {String}
 * @return {Object}
 */
exports.parseTag = function(str) {
  var tag = {};
  var lines = str.split('\n');
  var parts = exports.extractTagParts(lines[0]);
  var type = tag.type = parts.shift().replace('@', '');
  var matchType = new RegExp('^@?' + type + ' *');

  tag.string = str.replace(matchType, '');

  // if (lines.length > 1) {
  //   parts.push(lines.slice(1).join('\n'));
  // }

  // tag.string = parts.join('\n');

  // TODO Tag factories

  // switch (type) {
  //   case 'property':
  //   case 'template':
  //   case 'param':
  //     var typeString = parts.shift();
  //     tag.name = parts.shift() || '';
  //     tag.description = parts.join(' ');
  //     exports.parseTagTypes(typeString, tag);
  //     break;
  //   case 'define':
  //   case 'return':
  //   case 'returns':
  //     exports.parseTagTypes(parts.shift(), tag);
  //     tag.description = parts.join(' ');
  //     break;
  //   case 'see':
  //     if (~str.indexOf('http')) {
  //       tag.title = parts.length > 1
  //         ? parts.shift()
  //         : '';
  //       tag.url = parts.join(' ');
  //     } else {
  //       tag.local = parts.join(' ');
  //     }
  //     break;
  //   case 'api':
  //     tag.visibility = parts.shift();
  //     break;
  //   case 'public':
  //   case 'private':
  //   case 'protected':
  //     tag.visibility = type;
  //     break;
  //   case 'enum':
  //   case 'typedef':
  //   case 'type':
  //     exports.parseTagTypes(parts.shift(), tag);
  //     break;
  //   case 'lends':
  //   case 'memberOf':
  //     tag.parent = parts.shift();
  //     break;
  //   case 'extends':
  //   case 'implements':
  //   case 'augments':
  //     tag.otherClass = parts.shift();
  //     break;
  //   case 'borrows':
  //     tag.otherMemberName = parts.join(' ').split(' as ')[0];
  //     tag.thisMemberName = parts.join(' ').split(' as ')[1];
  //     break;
  //   case 'throws':
  //     tag.types = exports.parseTagTypes(parts.shift());
  //     tag.description = parts.join(' ');
  //     break;
  //   case 'description':
  //     tag.full = parts.join(' ').trim();
  //     break;
  //   default:
  //     tag.string = parts.join(' ');
  //     break;
  // }

  return tag;
};

/**
 * Parse tag type string "{Array|Object}" etc.
 * This function also supports complex type descriptors like in jsDoc or even
 * the enhanced syntax used by the [google closure compiler][1]
 *
 * The resulting array from the type descriptor:
 *
 *     {number|string|{name:string,age:number|date}}
 *
 * would look like this:
 *
 *     [
 *       'number',
 *       'string',
 *       {
 *         age: ['number', 'date'],
 *         name: ['string']
 *       }
 *     ]
 *
 * @param {String} str
 * @return {Array}
 *
 * [1] https://developers.google.com/closure/compiler/docs/js-for-compiler#types
 */

exports.parseTagTypes = function(str, tag) {
  var JSDParser = require('jsdoctypeparser').Parser;
  var Builder = require('jsdoctypeparser').Builder;
  var result = new JSDParser().parse(str.substr(1, str.length - 2));

  var types = (function transform(type) {
    if (type instanceof Builder.TypeUnion) {
      return type.types.map(transform);
    }
    else if (type instanceof Builder.TypeName) {
      return type.name;
    }
    else if (type instanceof Builder.RecordType) {
      return type.entries.reduce(function(obj, entry) {
        obj[entry.name] = transform(entry.typeUnion);
        return obj;
      }, {});
    }
    else {
      return type.toString();
    }
  }(result));

  if (tag) {
    tag.types = types;
    tag.optional = result.optional;
    tag.nullable = result.nullable;
    tag.nonNullable = result.nonNullable;
    tag.variable = result.variable;
  }

  return types;
};

/**
 * Determine if a parameter is optional.
 *
 * Examples:
 * JSDoc: {Type} [name]
 * Google: {Type=} name
 * TypeScript: {Type?} name
 *
 * @param {Object} tag
 * @return {Boolean}
 */

exports.parseParamOptional = function(tag) {
  var lastTypeChar = tag.types.slice(-1)[0].slice(-1);
  return tag.name.slice(0,1) === '[' || lastTypeChar === '=' || lastTypeChar === '?';
};
