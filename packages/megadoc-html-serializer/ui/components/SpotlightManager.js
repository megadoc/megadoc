const React = require('react');
const { findDOMNode } = require('react-dom');
const Spotlight = require('./Spotlight');
const contains = require('dom-contains');
const { KC_ESCAPE } = require('constants');
const { bool, func, object, string, } = React.PropTypes;
const DocumentURI = require('core/DocumentURI');

const SpotlightManager = React.createClass({
  propTypes: {
    active: bool.isRequired,
    onOpen: func.isRequired,
    onClose: func.isRequired,
    documentNode: object,
    pathname: string.isRequired,
    corpus: object.isRequired,
  },

  contextTypes: {
    documentURI: React.PropTypes.instanceOf(DocumentURI).isRequired,
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
    const { corpus } = this.props;

    if (this.props.active) {
      const symbols = this.props.documentNode ?
        getSymbolsForDocument(corpus, this.props.documentNode) :
        getSymbolsForDocumentByURI(corpus, this.context.documentURI.normalize(this.props.pathname))
      ;

      return (
        <Spotlight
          startInSymbolMode={this.state.openedInSymbolMode}
          corpus={corpus.getDocumentSearchIndex()}
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
    const superKey = e.ctrlKey || e.metaKey;

    if (keyName === 'k' && superKey) {
      e.preventDefault();

      if (this.props.active) {
        this.closeSpotlight();
      }
      else {
        this.openSpotlight();
      }
    }
    else if (e.which === 190 /*.*/ && superKey && !this.props.active) {
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
    if (contains(e.target, findDOMNode(this))) {
      this.closeSpotlight();
    }
  },
});

function getSymbolsForDocument(corpus, documentNode) {
  return corpus.getDocumentEntitySearchIndex(documentNode.uid);
}

function getSymbolsForDocumentByURI(corpus, uri) {
  const documentNode = corpus.getByURI(uri);

  if (documentNode) {
    return getSymbolsForDocument(corpus, documentNode);
  }
}

module.exports = SpotlightManager;
