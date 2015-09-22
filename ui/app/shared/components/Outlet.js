const React = require('react');
const OutletManager = require('core/OutletManager');

function getRenderer(element) {
  return element.renderer || element.component;
}

const Outlet = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    filters: React.PropTypes.object,
  },

  render() {
    return (
      <div>
        {this.renderElements({
          elements: OutletManager.getElements(this.props.name),
          elementProps: this.props.props,
          defaultRenderer: this.props.children
        })}

        {this.renderNextSiblings()}
      </div>
    );
  },

  renderElements(context) {
    const { elementProps, defaultRenderer } = context;
    const elements = context.elements;

    if (elements.length === 0) {
      return defaultRenderer || null;
    }
    else if (elements.length === 1) {
      const Renderer = getRenderer(elements[0]);
      return <Renderer {...elementProps} />;
    }
    else {
      return (
        <div>
          {elements.map(function(el) {
            const Renderer = getRenderer(el);

            return (
              <Renderer
                key={Renderer.getKey(props.props)}
                {...elementProps}
              />
            );
          })}
        </div>
      );
    }
  },

  renderNextSiblings() {
    const elements = OutletManager.getNextElements(this.props.name);

    return this.renderElements({
      elements,
      elementProps: this.props.siblingProps,
      defaultRenderer: null
    });
  }
});

module.exports = Outlet;
