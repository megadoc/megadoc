var React = require("react");
var classSet = require("utils/classSet");

var Label = React.createClass({
  propTypes: {
    fakeLabel: React.PropTypes.bool,
    value: React.PropTypes.string,
    className: React.PropTypes.string,
    children: React.PropTypes.any,
  },

  getDefaultProps: function() {
    return {
      fakeLabel: false
    };
  },

  render() {
    var Tag = this.props.fakeLabel ? 'div' : 'label';
    var className = classSet({ 'form-label': true });

    if (this.props.className) {
      className += ` ${this.props.className}`;
    }

    return (
      <Tag className={className}>
        <span className="form-label__caption">{this.props.value}</span>
        <div className="form-label__widget">
          {this.props.children}
        </div>
      </Tag>
    );
  }
});

module.exports = Label;