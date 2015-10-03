const React = require("react");
const classSet = require("utils/classSet");

const { oneOf, string, any, func, bool } = React.PropTypes;

/**
 * A wrapper for a skinnable button.
 */
const Button = React.createClass({
  propTypes: {
    type: oneOf(['default', 'danger', 'success']),
    className: string,
    title: string,
    children: any,
    onClick: func,
    onKeyPress: func,
    disabled: bool,
  },

  getDefaultProps: function() {
    return {
      type: 'default'
    };
  },

  render: function() {
    const { type } = this.props;

    let className = {};

    className['btn'] = true;
    className['btn-default'] = type === 'default';
    className['btn-danger'] = type === 'danger';
    className['btn-success'] = type === 'success';
    className[this.props.className] = !!this.props.className;

    return (
      <button
        onClick={this.props.onClick}
        onKeyPress={this.props.onKeyPress}
        title={this.props.title}
        disabled={this.props.disabled}
        type="button"
        className={classSet(className)}
        children={this.props.children}
      />
    );
  }
});

module.exports = Button;