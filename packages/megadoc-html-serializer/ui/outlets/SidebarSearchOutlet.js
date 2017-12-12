const React = require('react');
const Button = require('components/Button');
const Icon = require('components/Icon');
const classSet = require('classnames');

const SidebarSearchOutlet = React.createClass({
  propTypes: {
    $outletOptions:  React.PropTypes.shape({
      text:  React.PropTypes.string.isRequired,
      title: React.PropTypes.string,
      className:  React.PropTypes.string,
      icon: React.PropTypes.bool,
    }),
  },

  contextTypes: {
    appState:  React.PropTypes.object.isRequired,
  },

  render() {
    const options = this.props.$outletOptions;
    const text = options.text || 'Search';
    const { title } = options;

    return (
      <Button
        title={`${title || text} (Ctrl+K or CMD+K)`}
        className={classSet(options.className, 'sidebar-search-button')}
        onClick={this.toggleSpotlight}
      >
        {options.icon && (
          <span>
            <Icon className="icon-search" />
            {' '}
          </span>
        )}
        {text}
      </Button>
    );
  },

  toggleSpotlight() {
    if (this.context.appState.isSpotlightOpen()) {
      this.context.appState.closeSpotlight();
    }
    else {
      this.context.appState.openSpotlight();
    }
  }
});

module.exports = SidebarSearchOutlet;