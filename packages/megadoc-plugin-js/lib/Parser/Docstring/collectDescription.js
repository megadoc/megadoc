var NO_DESCRIPTION_TAGS = [
  'memberOf',
  'constructor',
  'class',
  'module',
  'extends',
  'private',
  'mixin',
  'preserveOrder',
  'alias',
  'type',
  'method',
];

function extractSwallowedDescriptionInTag(tag, fragments) {
  // Extract class description; sometimes it's kept in description.full,
  // other times it's swalloed inside a tag of type "class" or "constructor"
  if (NO_DESCRIPTION_TAGS.indexOf(tag.type) > -1) {
    if (tag.explicitReceiver) {
      tag.adjustString(tag.string.replace(tag.explicitReceiver, ''));
    }

    fragments.push(tag.string.trim());
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
  else if (tag.type === 'namespace') {
    var nsDescription = tag.string.split('\n').slice(1).join('\n');
    fragments.push(nsDescription);
  }
}

module.exports = function(doxDoc, id, tags) {
  var description = String(doxDoc.description.full);

  var fragments = tags.reduce(function(_fragments, tag) {
    extractSwallowedDescriptionInTag(tag, _fragments);
    return _fragments;
  }, []);

  if (fragments.length > 0) {
    description = [ description ].concat(fragments).join('');
  }

  if (id && description.substr(0, id.length) === id) {
    description = description.replace(id, '');
  }

  return description.trim();
};