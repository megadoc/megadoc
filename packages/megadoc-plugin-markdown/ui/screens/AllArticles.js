const React = require('react');
const HighlightedText = require('components/HighlightedText');
const Database = require('../Database');

const { string } = React.PropTypes;

const AllArticles = React.createClass({
  propTypes: {
    routeName: string,
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    const folders = Database.for(this.props.routeName).getFolders();

    return (
      <div>
        {folders.map(this.renderFolder)}
      </div>
    );
  },

  renderFolder(folder) {
    return (
      <div key={folder.title}>
        {folder.articles.map(this.renderArticle)}
      </div>
    );
  },

  renderArticle(article) {
    return (
      <div key={article.id} className="doc-content">
        <HighlightedText>{article.source}</HighlightedText>
      </div>
    );
  },

});

module.exports = AllArticles;