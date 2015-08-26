const Router = require('core/Router');
const Database = require('core/Database');
const { makeHref } = require('actions/RouteActions');
const resolveLink = require('tinydoc/plugins/cjs/resolveLink');

function linkTo(id, registry) {
  const router = Router.getSingleton();

  let currentModuleId;

  // Are we browsing some CJS module? If so, links could be relative to the
  // current module being browsed.
  if (router.isActive('js.module')) {
    currentModuleId = router.getCurrentParams().moduleId;
  }

  const link = resolveLink(id, Database.getAllTags(), registry, currentModuleId);

  if (link) {
    let queryParams = {};

    if (link.entityId) {
      queryParams.entity = link.entityId;
    }

    return {
      href: makeHref('js.module', {
        moduleId: link.moduleId
      }, queryParams),

      title: link.title
    };
  }
}

module.exports = linkTo;