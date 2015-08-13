var React = require("react");
var MarkdownText = require('components/MarkdownText');
var Database = require('core/Database');
var scrollIntoView = require('utils/scrollIntoView');

var Article = React.createClass({
  render() {
    var article = Database.get(this.props.collectionName, this.props.params.articleId);

    if (!article) {
      return <div>Article not found...</div>;
    }

    return (
      <div className="doc-content">
        <MarkdownText>{article.source}</MarkdownText>
      </div>
    );
  }
});

module.exports = Article;