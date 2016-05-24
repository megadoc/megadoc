var K = require('./constants');
var TypeInfo = require('./Docstring__TagTypeInfo');
var assert = require('assert');

var TypeAliases = {
  'returns': 'return'
};

/**
 * @param {Object} commentNode
 * @param {Object} options
 * @param {Object} options.customTags
 * @param {Boolean} [options.namedReturnTags=true]
 *
 * @param {String} nodeLocation
 */
function Tag(commentNode, params) {
  var options = params.config || {};
  var nodeLocation = params.nodeLocation;
  var customTags = options.customTags;

  if (commentNode.errors && commentNode.errors.length) {
    throw new Error(commentNode.errors[0]);
  }

  /**
   * @property {String}
   *           The type of this tag. This is always present.
   */
  this.type = TypeAliases[commentNode.tag] || commentNode.tag;

  /**
   * @property {String}
   *           The raw text.
   */
  this.string = String(commentNode.description || '');

  /**
   * @property {String}
   *           Available on @property, @type, @param, and @live_example tags.
   */
  this.typeInfo = {
    /**
     * @property {String}
     */
    name: null,

    /**
     * @property {String}
     */
    description: null,

    /**
     * @property {Boolean}
     */
    isOptional: null,

    /**
     * @property {String}
     */
    defaultValue: null,

    /**
     * @property {TagTypeInfo} typeInfo.type
     */
    type: null
  };

  switch(this.type) {
    case 'property':
    case 'param':
    case 'return':
    case 'throws':
    case 'example':
    case 'interface':
      this.typeInfo = TypeInfo(commentNode, nodeLocation);

      // fixup for return tags when we're not expecting them to be named
      if (this.type === 'return' && this.typeInfo.name && options.namedReturnTags === false) {
        this.typeInfo.description = this.typeInfo.name + ' ' + this.typeInfo.description;
        delete this.typeInfo.name;
      }

      break;

    case 'type':
      this.typeInfo = TypeInfo(commentNode, nodeLocation);

      break;

    case 'method':
      this.typeInfo = TypeInfo(commentNode, nodeLocation);
      this.typeInfo.type = { name: K.TYPE_FUNCTION };

      break;

    case 'protected':
    case 'private':
      break;

    case 'memberOf':
      this.typeInfo.name = commentNode.name;

      break;

    case 'module':
      if (commentNode.name.trim().length > 0) {
        this.typeInfo.name = commentNode.name.trim();
      }
      break;
    case 'class':
      this.typeInfo.type = K.TYPE_CLASS;
      if (commentNode.name.trim().length > 0) {
        this.typeInfo.name = commentNode.name.trim();
      }
      break;

    case 'namespace':
    case 'name':
    case 'alias':
    case 'lends':
    case 'mixes':
    case 'see':
      this.typeInfo.name = commentNode.name;
      break;
  }

  if (customTags && customTags.hasOwnProperty(this.type)) {
    this.useCustomTagDefinition(commentNode, customTags[this.type], nodeLocation);
  }

  return this;
}

Tag.prototype.toJSON = function() {
  return Object.keys(this).reduce(function(json, key) {
    if (this[key] !== null && typeof this[key] !== 'function' && key[0] !== '$') {
      json[key] = this[key];
    }

    return json;
  }.bind(this), {});
};

Tag.prototype.useCustomTagDefinition = function(commentNode, customTag, nodeLocation) {
  var customAttributes = customTag.attributes || [];

  if (customTag.withTypeInfo) {
    this.typeInfo = TypeInfo(commentNode, nodeLocation);
  }

  if (customTag.process instanceof Function) {
    customTag.process(createCustomTagAPI(this, customAttributes), nodeLocation);
  }
};

function createCustomTagAPI(tag, attrWhitelist) {
  var api = tag.toJSON();

  api.setCustomAttribute = function(name, value) {
    assert(attrWhitelist.indexOf(name) > -1,
      "Unrecognized custom attribute '" + name + "'. Make sure you " +
      "you specify it in the @attributes array for the customTag."
    );

    tag[name] = value;
  };

  return api;
}

module.exports = Tag;

// function renamePrimitiveType(type) {
//   if (type === 'Function') {
//     return 'function';
//   }
//   else {
//     return type;
//   }
// }
