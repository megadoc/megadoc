const Router = require('core/Router');
const Database = require('core/Database');
const resolveLink = require('tinydoc/plugins/cjs/resolveLink');

function linkTo(id, registry) {
  let currentModuleId;

  // Are we browsing some CJS module? If so, links could be relative to the
  // current module being browsed.
  if (Router.isActive('js.module')) {
    currentModuleId = Router.getParamItem('moduleId');
  }

  let link;
  let databaseContainingLink;

  Database.getAllDatabases().some(function(database) {
    link = resolveLink(id, database.getAllDocs(), registry, currentModuleId);
    databaseContainingLink = database;

    return !!link;
  });

  if (link) {
    let queryParams = {};
    let routeName = databaseContainingLink.getKey();

    if (link.entityId) {
      queryParams.entity = link.entityId;
    }

    return {
      href: Router.makeHref(`${routeName}.module`, {
        moduleId: link.moduleId
      }, queryParams),

      title: link.title
    };
  }
}

module.exports = linkTo;