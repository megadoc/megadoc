const React = require("react");
const MarkdownText = require('components/MarkdownText');
const scrollIntoView = require('utils/scrollIntoView');

const { shape, object, bool } = React.PropTypes;

const AllArticles = React.createClass({
  componentDidMount() {
    this.jumpIfNeeded();
  },

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.activeArticleId !== this.props.activeArticleId ||
      prevProps.query.section !== this.props.query.section
    ) {
      this.jumpIfNeeded();
    }
  },

  render() {
    return (
      <div>
        {this.props.articles.map(this.renderArticle)}
      </div>
    );
  },

  renderArticle(article) {
    return (
      <div ref={article.id} key={article.id} className="doc-content">
        <MarkdownText jumpy>{article.source}</MarkdownText>
      </div>
    );
  },


  jumpIfNeeded() {
    const { activeArticleId } = this.props;

    if (activeArticleId && this.refs[activeArticleId] && !this.props.query.section) {
      scrollIntoView(React.findDOMNode(this.refs[activeArticleId]));
    }
  },

});

module.exports = AllArticles;