var React = require("react");
var MarkdownText = require('components/MarkdownText');
var GitStats = require('components/GitStats');
var Database = require('core/Database');
var config = require('config');
var Disqus = require('components/Disqus');
var scrollToTop = require('utils/scrollToTop');
var HasTitle = require('mixins/HasTitle');

var Article = React.createClass({
  mixins: [
    HasTitle(function() {
      var article = Database.get(this.props.collectionName, this.props.params.articleId);
      var collection = Database.getCollectionTitle(this.props.collectionName);

      if (article) {
        return `[${collection}] ${article.title}`;
      }
    })
  ],

  componentDidMount: function() {
    scrollToTop();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.params.articleId !== this.props.params.articleId) {
      scrollToTop();
    }
  },

  render() {
    var article = Database.get(this.props.collectionName, this.props.params.articleId);

    if (!article) {
      return <div>Article not found...</div>;
    }

    return (
      <div className="doc-content">
        <MarkdownText jumpy>{article.source}</MarkdownText>

        {config.gitStats && (
          <GitStats {...article.git} />
        )}

        <Disqus identifier={article.id} title={article.title} />
      </div>
    );
  }
});

module.exports = Article;