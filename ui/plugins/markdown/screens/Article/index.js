var React = require("react");
var MarkdownText = require('components/MarkdownText');
var GitStats = require('components/GitStats');
var Database = require('core/Database');
var config = require('config');
var Disqus = require('components/Disqus');

var Article = React.createClass({
  render() {
    var article = Database.get(this.props.collectionName, this.props.params.articleId);

    if (!article) {
      return <div>Article not found...</div>;
    }

    return (
      <div className="doc-content">
        <MarkdownText>{article.source}</MarkdownText>

        {config.gitStats && (
          <GitStats {...article.git} />
        )}

        <Disqus identifier={article.id} title={article.title} />
      </div>
    );
  }
});

module.exports = Article;