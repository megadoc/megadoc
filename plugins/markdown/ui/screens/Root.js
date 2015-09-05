var React = require('react');
var Database = require('core/Database');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

var MarkdownRoot = React.createClass({
  render() {
    return (
      <TwoColumnLayout className="markdown-root">
        <LeftColumn>
          <ClassBrowser
            activeArticleId={this.props.params.splat}
            folders={Database.getFolders()}
            articles={Database.getArticles()}
          />
        </LeftColumn>

        <RightColumn>
          <div className="markdown-root__content">
            <RouteHandler {...this.props} />
          </div>
        </RightColumn>
      </TwoColumnLayout>
    );
  }
});

module.exports = MarkdownRoot;