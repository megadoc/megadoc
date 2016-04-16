module.exports = function(api, config) {
  if (config.file.toc && config.anchorableHeadings) {
    const uidMatcher = new RegExp(`^${config.url}`);

    api.registerSymbolIndexer(function(uid) {
      if (uid.match(uidMatcher)) {
        return config.file.toc.map(function(heading) {
          return {
            $1: Array(heading.level).join('  ') + heading.text,
            link: {
              href: heading.id
            }
          }
        });
      }
    });
  }
};