const React = require('react');
const domContains = require('dom-contains');
const config = require('config');
const Tooltip = require('components/Tooltip');
const Outlet = require('components/Outlet');
const { debounce } = require('lodash');
const { hasMatchingElements } = Outlet;

const TooltipManager = React.createClass({
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

    const content = inspectElement(this.state.element);

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
    else if (e.target === React.findDOMNode(this)) {
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
    return config.layout === 'single-page' ?
      document.querySelector('.single-page-layout__content') :
      document.querySelector('.two-column-layout__right') ||
      document.querySelector('.root__screen')
    ;
  },

});

function isApplicable(containerNode, node) {
  return (
    node.tagName === 'A' &&
    domContains(containerNode, node)
  );
}

function inspectElement(el) {
  const { corpus } = tinydoc;
  const documentNode = corpus.getByURI(el.href.replace(/^[^#]*#/, ''));

  if (documentNode) {
    const context = {
      documentNode,
      namespaceNode: tinydoc.corpus.getNamespaceOfDocument(documentNode.uid),
    };

    if (hasMatchingElements({ name: 'Inspector', elementProps: context })) {
      return <Outlet name="Inspector" elementProps={context} />;
    }
  }

  return legacy__inspectElement(el);
}

function legacy__inspectElement(el) {
  let content;
  const href = decodeURIComponent( el.href.replace(/^[^#]*#/, '') );

  tinydoc.getPreviewHandlers().some(function(fn) {
    content = fn(href);
    return !!content;
  });

  return content;
}


module.exports = TooltipManager;
