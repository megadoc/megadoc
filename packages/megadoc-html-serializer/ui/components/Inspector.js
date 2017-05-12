const React = require('react');
const { findDOMNode } = require('react-dom');
const domContains = require('dom-contains');
const Tooltip = require('./InspectorTooltip');
const { Outlet, OutletRenderer } = require('react-transclusion');
const { debounce } = require('lodash');
const { PropTypes } = React;

const Inspector = React.createClass({
  propTypes: {
    inSinglePageMode: PropTypes.bool,
    isOutletOccupied: PropTypes.func.isRequired,
    corpus: PropTypes.object,
  },

  getInitialState() {
    return {
      element: null
    };
  },

  componentDidMount() {
    this.debouncedShowTooltip = debounce(this.showTooltip, 10);
    this.debouncedHideTooltip = debounce(this.hideTooltip, 10);

    window.addEventListener('mouseover', this.debouncedShowTooltip, false);
    window.addEventListener('mouseout', this.debouncedHideTooltip, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener('mouseout', this.debouncedHideTooltip, false);
    window.removeEventListener('mouseover', this.debouncedShowTooltip, false);
  },

  render() {
    if (!this.state.element) {
      return null;
    }

    const content = this.inspectElement(this.props.corpus, this.state.element);

    if (!content) {
      return null;
    }

    return (
      <Tooltip target={this.state.element}>
        {content}
      </Tooltip>
    );
  },

  showTooltip(e) {
    if (isApplicable(this.getContainerDOMNode(), e.target)) {
      if (this.state.element !== e.target) {
        this.setState({ element: e.target });
      }
    }
    else if (e.target === findDOMNode(this)) {
      return;
    }
    else if (this.state.element) {
      this.setState({ element: null });
    }
  },

  hideTooltip(e) {
    if (e.target === this.state.element) {
      this.setState({ element: null });
    }
  },

  getContainerDOMNode() {
    return this.props.inSinglePageMode ?
      document.querySelector('.single-page-layout__content') :
      document.querySelector('.two-column-layout__right') ||
      document.querySelector('.root__screen')
    ;
  },

  inspectElement(corpus, el) {
    const href = decodeURIComponent(el.href.replace(location.origin, ''));
    const documentNode = corpus.getByURI(href);

    if (documentNode) {
      const context = {
        documentNode,
        namespaceNode: corpus.getNamespaceOfDocument(documentNode),
      };

      if (this.props.isOutletOccupied({ name: 'Inspector', elementProps: context })) {
        return <Outlet name="Inspector" elementProps={context} />;
      }
    }
  }

});

function isApplicable(containerNode, node) {
  return (
    node.tagName === 'A' &&
    domContains(containerNode, node)
  );
}

module.exports = OutletRenderer(Inspector);
