const React = require('react');
const WPM = 275; // https://help.medium.com/hc/en-us/articles/214991667-Read-time

module.exports = function(config, database) {
  const PREVIEW_MATCHER = new RegExp('^/' + config.routeName + '/([^\/]+)$');

  return function preview(href) {
    if (href.match(PREVIEW_MATCHER)) {
      const articleId = RegExp.$1;
      const doc = database.get(articleId);

      if (doc) {
        const expectedReadTime = Math.ceil(doc.wordCount / WPM);

        return (
          <p>
            {doc.title} <small>({expectedReadTime} min read)</small>
          </p>
        );
      }
    }
  };
}