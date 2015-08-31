var extend = require('lodash').extend;
var parseProperty = require('./parseProperty');

var NO_DESCRIPTION_TAGS = [
  'memberOf',
  'constructor',
  'class',
  'extends',
  'private',
  'mixin',
  'module',
  'preserveOrder',
];

function decorateTag(doc, tag) {
  var tagType = tag.type;

  // discard things we're not using
  delete tag.nullable;
  delete tag.nonNullable;
  delete tag.variable;
  delete tag.typesDescription;

  switch(tagType) {
    case 'property':
    case 'param':
      extend(tag, parseProperty(tag.string));
      break;
  }

  // attach IDs
  switch(tagType) {
    case 'property':
      tag.id = tag.name;
      break;

    // if it was marked @method, treat it as such (not stupid "property" type
    // on object modules)
    case 'method':
      doc.ctx.type = 'method';
      break;

    case 'protected':
      doc.isProtected = true;
      break;

    case 'memberOf':
      doc.ctx.receiver = tag.parent;
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

    doc.$descriptionFragments.push(desc.replace(/^\n/, ''));
  }

  return tag;
}

module.exports = decorateTag;