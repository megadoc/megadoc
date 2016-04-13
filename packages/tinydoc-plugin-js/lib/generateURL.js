function generateURL(doc, parentDoc, routeName) {
  var fragments = [ routeName, 'modules' ];

  // This is a link to a module entity, like [Module@propName] or
  // [Module#methodName]:
  if (parentDoc) {
    fragments.push(parentDoc.id);
    fragments.push(doc.ctx.symbol + doc.name);
  }
  // a direct link to a module:
  else {
    fragments.push(doc.id);
  }

  return fragments.map(encodeURIComponent).join('/');
}

module.exports = generateURL;