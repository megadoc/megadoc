const React = require('react');
const HighlightedText = require('components/HighlightedText');
const Database = require('core/Database');
const Router = require('core/Router');

const { shape, object, bool } = React.PropTypes;

const AllArticles = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },

  render() {
    const articles = Database.for(this.props.routeName).getArticles();

    return (
      <div>
        {articles.map(this.renderArticle)}
      </div>
    );
  },

  renderArticle(article) {
    return (
      <div ref={article.id} key={article.id} className="doc-content">
        <h1
          id={Router.generateAnchorId({
            routeName: `${this.props.routeName}.article`,
            params: {
              articleId: encodeURIComponent(article.id)
            }
          })}

          children={article.title}
        />

        <HighlightedText>{article.source}</HighlightedText>
      </div>
    );
  },

});

module.exports = AllArticles;