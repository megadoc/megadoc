const React = require('react');
const Spotlight = require('components/Spotlight');
const contains = require('dom-contains');
const { KC_ESCAPE } = require('constants');
const { bool, func, } = React.PropTypes;
const config = require('config');

const SpotlightManager = React.createClass({
  propTypes: {
    active: bool.isRequired,
    onOpen: func.isRequired,
    onClose: func.isRequired,
  },

  componentDidMount() {
    window.addEventListener('keydown', this.handleGlobalKeybindings, true);

    if (this.props.active) {
      this.closeSpotlightOnExternalClicks();
    }
  },

  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      this.closeSpotlightOnExternalClicks();
    }
    else if (prevProps.active && !this.props.active) {
      this.stopClosingSpotlightOnExternalClicks();
    }
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeybindings, true);
  },

  render() {
    if (this.props.active) {
      return (
        <Spotlight
          corpus={config.corpus}
          onChange={this.closeSpotlight}
        />
      );
    }
    else {
      return null;
    }
  },

  openSpotlight() {
    this.props.onOpen();
  },

  closeSpotlight() {
    this.props.onClose();
  },

  handleGlobalKeybindings(e) {
    const keyName = String.fromCharCode(e.which).toLowerCase();

    if (keyName === 'k' && e.ctrlKey) {
      e.preventDefault();

      if (this.props.active) {
        this.closeSpotlight();
      }
      else {
        this.openSpotlight();
      }
    }
    else if (e.which === KC_ESCAPE) {
      e.preventDefault();

      this.closeSpotlight();
    }
  },

  closeSpotlightOnExternalClicks() {
    window.addEventListener('click', this.doCloseSpotlightOnExternalClicks, false);
  },

  stopClosingSpotlightOnExternalClicks() {
    window.removeEventListener('click', this.doCloseSpotlightOnExternalClicks, false);
  },

  doCloseSpotlightOnExternalClicks(e) {
    if (contains(e.target, React.findDOMNode(this))) {
      this.closeSpotlight();
    }
  }
});

module.exports = SpotlightManager;
