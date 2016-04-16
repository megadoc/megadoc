module.exports = function(api, config) {
  const docIdExtractor = new RegExp(`^/${config.routeName}/([^/]+)`);

  api.registerSymbolIndexer(function(uid) {
    if (uid.match(docIdExtractor)) {
      const href = `${config.routeName}/${RegExp.$1}`; // ....
      const referencedDoc = config.database.filter(x => x.href === href)[0];

      if (referencedDoc) {
        return referencedDoc.sections.map(function(section) {
          return {
            $1: Array(section.level).join('  ') + section.text,
            link: {
              href: section.id
            }
          }
        });
      }
    }
  });
};