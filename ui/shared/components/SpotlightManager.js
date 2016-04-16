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

  getInitialState() {
    return {
      openedInSymbolMode: false
    };
  },

  componentDidMount() {
    window.addEventListener('keydown', this.handleGlobalKeybindings, true);

    if (this.props.active) {
      this.closeSpotlightOnExternalClicks();
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.active && this.props.active) {
      this.closeSpotlightOnExternalClicks();
    }
    else if (prevProps.active && !this.props.active) {
      this.stopClosingSpotlightOnExternalClicks();
    }

    if (prevState.openedInSymbolMode) {
      this.setState({ openedInSymbolMode: false });
    }
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeybindings, true);
  },

  render() {
    if (this.props.active) {
      const symbols = getSymbolsForDocument(location.hash.replace(/^#/, ''));

      return (
        <Spotlight
          startInSymbolMode={this.state.openedInSymbolMode}
          corpus={config.corpus}
          symbols={symbols}
          onActivate={this.closeSpotlight}
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
    const metaPressed = e.ctrlKey || e.metaKey;

    if (keyName === 'k' && metaPressed) {
      e.preventDefault();

      if (this.props.active) {
        this.closeSpotlight();
      }
      else {
        this.openSpotlight();
      }
    }
    else if (e.which === 190 /*.*/ && metaPressed && !this.props.active) {
      e.preventDefault();

      this.setState({ openedInSymbolMode: true }, () => {
        this.openSpotlight();
      });
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
  },
});

function getSymbolsForDocument(documentUID) {
  let symbols;

  tinydoc.getSymbolIndexers().some(function(fn) {
    symbols = fn(documentUID);
    return !!symbols;
  });

  return symbols;
}

module.exports = SpotlightManager;
