module.exports = function(api, config) {
  const idExtractor = new RegExp(`^/${config.routeName}/resources/([^/]+)`);

  api.registerSymbolIndexer(function(uid) {
    if (uid.match(idExtractor)) {
      const id = RegExp.$1;
      const referencedDoc = config.database.filter(x => x.id === id)[0];

      if (referencedDoc) {
        return referencedDoc.endpoints.map(function(endpoint) {
          return {
            $1: '#' + endpoint.title,
            link: {
              href: `/${config.routeName}/resources/${id}/endpoints/${encodeURIComponent(endpoint.scoped_id)}`,
              context: 'Endpoint'
            }
          }
        }).concat(referencedDoc.objects.map(function(object) {
          return {
            $1: `{${object.title}}`,
            link: {
              href: `/${config.routeName}/resources/${id}/objects/${encodeURIComponent(object.scoped_id)}`,
              context: 'Object'
            }
          }
        }));
      }
    }
  });
};