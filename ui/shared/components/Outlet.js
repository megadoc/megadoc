const React = require('react');
const OutletManager = require('core/OutletManager');
const { string, object, any, bool, func, } = React.PropTypes;

function getRenderer(element) {
  return element.renderer || element.component;
}

/**
 * @namespace UI.Components
 *
 * An outlet is a container element that allows you to render other components
 * inside of it. These elements may be registered at boot-time, and they
 * will be rendered in the correct place in the UI at the correct time.
 */
const Outlet = React.createClass({
  statics: {
    add: OutletManager.add,
    has: OutletManager.has,
    define: OutletManager.define,
  },

  propTypes: {
    name: string.isRequired,

    props: object,
    siblingProps: object,

    tagName: string,
    children: any,

    alwaysRenderChildren: bool,
    forwardChildren: bool,

    fnRenderElement: func,
    fnRenderDefaultChild: func,
  },

  getDefaultProps() {
    return {
      props: {},
      tagName: 'div',
      children: null,
      alwaysRenderChildren: false,
    };
  },

  render() {
    const { alwaysRenderChildren } = this.props;
    const Tag = this.props.tagName;
    const siblingProps = this.props.siblingProps || this.props.props;

    const prevSiblings = this.renderElements({
      elements: OutletManager.getPrevElements(this.props.name),
      elementProps: siblingProps
    });

    const nextSiblings = this.renderElements({
      elements: OutletManager.getNextElements(this.props.name),
      elementProps: siblingProps
    });

    const selfElements = this.renderElements({
      elements: OutletManager.getElements(this.props.name),
      elementProps: this.props.props
    });

    const hasSelfElements = [].concat(selfElements || []).filter(x => !!x).length > 0;

    const stack = [];

    if (prevSiblings) {
      stack.push(prevSiblings);
    }

    if (selfElements) {
      stack.push(selfElements);
    }

    if (!hasSelfElements || alwaysRenderChildren) {
      stack.push(this.props.children);
    }

    if (nextSiblings) {
      stack.push(nextSiblings);
    }

    if (this.props.fnRenderDefaultChild && stack.filter(x => !!x).length === 0) {
      stack.push(this.props.fnRenderDefaultChild(this.props.props));
    }

    return <Tag>{stack}</Tag>;
  },

  renderElements({ elements, elementProps }) {
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
        return null;
      }
    }

    if (elements.length === 0) {
      return null;
    }
    else if (elements.length === 1) {
      return this.renderElement(elements[0], elementProps);
    }
    else {
      return elements.map(this.renderElementWithProps.bind(null, elementProps));
    }
  },

  renderElement(el, props) {
    const Component = getRenderer(el);

    if (el.match && !el.match(props)) {
      return null;
    }

    if (this.props.forwardChildren) {
      props.children = this.props.children;
    }

    const key = el.key || Component.getKey && Component.getKey(props.props);

    if (this.props.fnRenderElement) {
      return this.props.fnRenderElement(key, props, Component);
    }
    else {
      return <Component key={key} {...props} />;
    }
  },

  renderElementWithProps(props, el) {
    return this.renderElement(el, props);
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
