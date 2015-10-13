var React = require('react');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

module.exports = function createRoot(routeName) {
  return React.createClass({
    displayName: 'JSRoot',

    propTypes: {
      query: React.PropTypes.object,
      params: React.PropTypes.shape({
        moduleId: React.PropTypes.string,
      })
    },

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
              routeName={routeName}
              activeModuleId={this.props.params.moduleId}
            />
          </LeftColumn>

          <RightColumn>
            <div className="js-root__content">
              <RouteHandler routeName={routeName} {...this.props} />
            </div>
          </RightColumn>

        </TwoColumnLayout>
      );
    }
  });
};