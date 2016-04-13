const React = require('react');
const domContains = require('dom-contains');
const config = require('config');
const Tooltip = require('components/Tooltip');

const TooltipManager = React.createClass({
  getInitialState() {
    return {
      element: null
    };
  },

  componentDidMount() {
    window.addEventListener('mouseover', this.showTooltip, false);
    window.addEventListener('mouseout', this.hideTooltip, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener('mouseout', this.hideTooltip, false);
    window.removeEventListener('mouseover', this.showTooltip, false);
  },

  render() {
    if (!this.state.element) {
      return null;
    }

    const content = getContentForElement(this.state.element);

    return (
      <Tooltip target={this.state.element}>
        {content}
      </Tooltip>
    )
  },

  showTooltip(e) {
    if (isApplicable(this.getContainerDOMNode(), e.target)) {
      this.setState({ element: e.target });
      console.log('showing tooltip for!', e.target);
    }
  },

  hideTooltip(e) {
    if (e.target === this.state.element) {
      this.setState({ element: null });
      return;
    }
    // if (isApplicable(this.getContainerDOMNode(), e.target)) {
    //   console.log('hiding tooltip for!', e.target);
    // }
  },

  getContainerDOMNode() {
    return config.layout === 'single-page' ?
      document.querySelector('.single-page-layout__content') :
      document.querySelector('.two-column-layout__right') ||
      document.querySelector('.root')
    ;
  },

});

function isApplicable(containerNode, node) {
  return (
    node.tagName === 'A' &&
    domContains(containerNode, node)
  );
}

function getContentForElement(el) {
  const href = el.href.replace(/^#?/, '');
  const token = config.corpus.filter(function(x) {
    return x.link.href === href;
  })[0];


  if (token) {
    const plugin = config.pluginConfigs.filter(x => x.corpusContext === token.link.context)[0];
    const doc = plugin.database.filter(x => x.href === href)[0];

    if (doc) {
      console.log('found matching document!', doc);
    }
  }

  return 'stub';
}

module.exports = TooltipManager;
