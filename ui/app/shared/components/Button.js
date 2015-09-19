var React = require("react");
var classSet = require("react/lib/cx");

/**
 * @class Events.Components.Button
 *
 * A wrapper for `<button type="button" />` that abstracts the bootstrap CSS
 * classes we need to specify for buttons.
 */
var Button = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['default', 'danger', 'success']),
    className: React.PropTypes.string,
    title: React.PropTypes.string,
    children: React.PropTypes.any,
    onClick: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      type: 'default'
    };
  },

  render: function() {
    var className = {};
    var type = this.props.type;

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