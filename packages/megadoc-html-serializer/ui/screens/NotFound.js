const React = require('react');
const { Outlet } = require('react-transclusion');

const { PropTypes } = React;

const NotFound = React.createClass({
  contextTypes: {
    transitionTo: PropTypes.func.isRequired,
  },

  propTypes: {
    location: PropTypes.object.isRequired,
    resolveScope: PropTypes.func.isRequired,
    corpus: PropTypes.object.isRequired,
  },

  render() {
    return (
      <Outlet name="Layout::NotFound" elementProps={{ goBack: this.goSomewhereSafe }}>
        <div className="not-found">
          <p>
            Sorry! There's nothing here for you to see. This is likely a
            configuration error.
          </p>

          <div className="margin-tb-m">
            <a onClick={this.goSomewhereSafe}>
              Go back.
            </a>
          </div>
        </div>
      </Outlet>
    );
  },

  goSomewhereSafe() {
    const { location } = this.props;
    const anchor = location.hash.replace('#', '');

    if (anchor && anchor.length) {
      const withoutAnchor = this.props.resolveScope(Object.assign({}, location, {
        hash: ''
      }))

      if (withoutAnchor.scope) {
        this.context.transitionTo(location.pathname);
      }
    }
    else {
      this.context.transitionTo('/index.html');
    }
  }
});

module.exports = NotFound;
