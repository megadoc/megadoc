const React = require('react');
const OutletManager = require('core/OutletManager');
const { string, object, any } = React.PropTypes;

function getRenderer(element) {
  return element.renderer || element.component;
}

const Outlet = React.createClass({
  propTypes: {
    name: string.isRequired,

    props: object.isRequired,
    siblingProps: object,

    tagName: string,
    children: any,
  },

  getDefaultProps: function() {
    return {
      tagName: 'div'
    };
  },

  render() {
    const Tag = this.props.tagName;
    const siblingProps = this.props.siblingProps || this.props.props;

    const prevSiblings = this.renderElements({
      elements: OutletManager.getPrevElements(this.props.name),
      elementProps: siblingProps,
      defaultRenderer: null
    });

    const nextSiblings = this.renderElements({
      elements: OutletManager.getNextElements(this.props.name),
      elementProps: siblingProps,
      defaultRenderer: null
    });

    const selfElements = this.renderElements({
      elements: OutletManager.getElements(this.props.name),
      elementProps: this.props.props,
      defaultRenderer: this.props.children
    });

    if (prevSiblings || nextSiblings) {
      return (
        <Tag>
          {prevSiblings}
          {selfElements}
          {nextSiblings}
        </Tag>
      );
    }
    else {
      return selfElements;
    }
  },

  renderElements(context) {
    const { elements, elementProps, defaultRenderer } = context;
    const options = OutletManager.get(this.props.name).options;

    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Outlet "%s" has %d elements.', this.props.name, elements.length);
    // }

    if (options.firstMatching) {
      const el = this.getFirstMatchingElement(elements, elementProps);

      if (el) {
        return this.renderElement(el, elementProps);
      }
      else {
        return defaultRenderer;
      }
    }

    if (elements.length === 0) {
      return defaultRenderer || null;
    }
    else if (elements.length === 1) {
      return this.renderElement(elements[0], elementProps);
    }
    else {
      return (
        <div>
          {elements.map((el) => {
            return this.renderElement(el, elementProps);
          })}
        </div>
      );
    }
  },

  renderElement(el, props) {
    const Renderer = getRenderer(el);

    return (
      <Renderer
        key={Renderer.getKey && Renderer.getKey(props.props)}
        {...props}
      />
    );
  },

  getFirstMatchingElement(elements, elementProps) {
    for (let i = 0; i < elements.length; ++i) {
      const element = elements[i];

      if (element.match && element.match(elementProps)) {
        return element;
      }
    }
  },
});

module.exports = Outlet;
