var React = require('react');
var Database = require('core/Database');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

var JSRoot = React.createClass({
  getInitialState: function() {
    return {
      sidebarWidth: '240px'
    };
  },

  render() {
    return (
      <TwoColumnLayout className="js-root">
        <LeftColumn>
          <ClassBrowser
            activeClassId={this.props.params.moduleId}
            modules={Database.getModules()}
          />
        </LeftColumn>

        <RightColumn>
          <div className="js-root__content">
            <RouteHandler {...this.props} />
          </div>
        </RightColumn>

      </TwoColumnLayout>
    );
  }
});

module.exports = JSRoot;