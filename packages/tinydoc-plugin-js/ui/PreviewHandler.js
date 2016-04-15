const React = require('react');

module.exports = function(config, database) {
  const PREVIEW_MATCHER = new RegExp('^/' + config.routeName + '/modules/([^\/]+)(?:/(.+))?$');

  return function preview(href) {
    if (href.match(PREVIEW_MATCHER)) {
      const moduleId = RegExp.$1;
      const entityName = RegExp.$2;

      if (entityName && entityName.length) {
        const doc = database.getEntityByPath(moduleId + entityName);

        if (!doc) {
          return;
        }

        return (
          <div>
            <div className="tooltip__title">
              {doc.id} (<strong>{doc.ctx.type}</strong>)
            </div>

            <p children={doc.summary} />
          </div>
        );
      }
      else {
        const doc = database.getModule(moduleId);

        if (!doc) {
          return;
        }

        return (
          <div>
            <div className="tooltip__title">
              {doc.id} (<strong>{doc.ctx.type}</strong>)
            </div>

            <p children={doc.summary} />
          </div>
        );
      }
    }
  };
}