module.exports = function(api, config) {
  const uidMatcher = new RegExp(`^/${config.routeName}`);

  api.registerSymbolIndexer(function(uid) {
    if (uid.match(uidMatcher)) {
      const uidWithoutLeadingSlash = uid.slice(1); // ....
      const referencedDoc = config.database.filter(x => x.href === uidWithoutLeadingSlash)[0];

      if (referencedDoc) {
        const receiver = referencedDoc.isModule ? referencedDoc.id : referencedDoc.receiver;

        return config.database.filter(x => x.receiver === receiver).map(function(doc) {
          return {
            $1: `${doc.ctx.symbol}${doc.name}`,
            link: {
              href: '/'+doc.href
            }
          }
        });
      }
    }
  });
};