const React = require('react');
const Button = require('components/Button');
const classSet = require('classnames');

const SidebarSearchOutlet = React.createClass({
  propTypes: {
    $outletOptions:  React.PropTypes.shape({
      text:  React.PropTypes.string.isRequired,
      className:  React.PropTypes.string,
    }),
  },

  contextTypes: {
    appState:  React.PropTypes.object.isRequired,
  },

  render() {
    const text = this.props.$outletOptions.text || 'Search';

    return (
      <Button
        title={`${text} (Ctrl+K or CMD+K)`}
        className={classSet(this.props.$outletOptions.className, 'sidebar-search-button')}
        onClick={this.toggleSpotlight}
        children={text}
      />
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