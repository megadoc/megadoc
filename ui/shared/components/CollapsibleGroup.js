const React = require('react');
const Collapsible = require('mixins/Collapsible');
const classSet = require('utils/classSet');
const findChildByType = require('utils/findChildByType');
const Heading = require('components/Heading');
const Icon = require('components/Icon');

const { oneOfType, number, string, any, func } = React.PropTypes;

const CollapsibleGroup = React.createClass({
  mixins: [ Collapsible ],

  propTypes: {
    tagName: string,
    className: string,
    children: any,
  },

  getDefaultProps: function() {
    return {
      tagName: 'div'
    };
  },

  render() {
    const DOMTag = this.props.tagName;
    const isCollapsed = this.isCollapsed();

    const className = classSet({
      'collapsible': this.isCollapsible(),
      'collapsible--collapsed': isCollapsed
    });

    return (
      <DOMTag className={`${className} ${this.props.className||''}`}>
        {this.renderHeading()}
        {!isCollapsed && this.renderBody()}
      </DOMTag>
    );
  },

  renderHeading() {
    const child = findChildByType(this.props.children, CollapsibleGroup.Heading);

    if (!child) {
      return null;
    }

    return React.cloneElement(child, {
      onClick: this.toggleCollapsed
    }, child.props.children);
  },

  renderBody() {
    return findChildByType(this.props.children, CollapsibleGroup.Body);
  }
});

CollapsibleGroup.Heading = React.createClass({
  propTypes: {
    level: oneOfType([string, number]),
    onClick: func,
    children: any,
  },

  getDefaultProps: function() {
    return {
      level: '4'
    };
  },

  render() {
    return (
      <Heading
        level={this.props.level}
        className="collapsible-header"
        onClick={this.props.onClick}
        children={this.props.children}
      />
    )
  }
});

CollapsibleGroup.Collapser = React.createClass({
  render() {
    return (
      <Icon className="collapser icon-arrow-down" />
    );
  }
});

CollapsibleGroup.Body = React.createClass({
  render() {
    return (
      <div {...this.props} />
    )
  }
});

module.exports = CollapsibleGroup;