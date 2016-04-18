const React = require('react');

module.exports = function(config, database) {
  const PREVIEW_MATCHER = new RegExp('^/' + config.routeName + '/modules/([^\/]+)(?:/(.+))?$');

  return function preview(href) {
    if (href.match(PREVIEW_MATCHER)) {
      const moduleId = RegExp.$1;
      const entityName = RegExp.$2;

      // forget it if we're on that module page!
      if (location.hash.match(RegExp(config.routeName + '/modules/' + moduleId))) {
        return;
      }

      let doc;

      if (entityName && entityName.length) {
        doc = database.getEntityByPath(moduleId + entityName);
      }
      else {
        doc = database.getModule(moduleId);
      }

      if (doc) {
        return render(doc);
      }
    }
  };

  function render(doc) {
    return (
      <div>
        <div className="tooltip__title">
          {doc.id} (<strong>{doc.ctx.type}</strong> in {config.corpusContext})
        </div>

        <p children={doc.summary} />
      </div>
    );
  }
}