const invariant = require('utils/invariant');

function getRegionsForDocument({ documentNode, layouts, pathname }) {
  if (!layouts) {
    return null;
  }

  const entry = layouts.filter(x => {
    invariant(x.hasOwnProperty('match'),
      "A custom layout must have a @match property defined!"
    );

    const matchBy = x.match.by;
    const matchOn = arrayWrap(x.match.on);

    return (
      (
        documentNode &&
        matchBy === 'type' &&
        matchOn.indexOf(documentNode.type) > -1
      ) ||
      (
        documentNode &&
        matchBy === 'uid' &&
        matchOn.indexOf(documentNode.uid) > -1
      ) ||
      (
        matchBy === 'url' &&
        matchOn.indexOf(pathname.split('#')[0]) > -1
      )
    );
  })[0];

  if (entry) {
    return entry.regions;
  }
}

function arrayWrap(x) {
  return Array.isArray(x) ? x : [].concat(x || []);
}

exports.getRegionsForDocument = getRegionsForDocument;