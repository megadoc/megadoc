var React = require('react');
var Database = require('core/Database');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

var MarkdownRoot = React.createClass({
  render() {
    var { collectionName } = this.props;

    return (
      <TwoColumnLayout className="markdown-root">
        <LeftColumn>
          <ClassBrowser
            collectionName={collectionName}
            activeArticleId={this.props.params.articleId}
            folders={Database.getFolders(collectionName)}
            articles={Database.getArticleTitles(collectionName)}
          />
        </LeftColumn>

        <RightColumn>
          <div className="markdown-root__content">
            <RouteHandler collectionName={collectionName} {...this.props} />
          </div>
        </RightColumn>
      </TwoColumnLayout>
    );
  }
});

module.exports = MarkdownRoot;