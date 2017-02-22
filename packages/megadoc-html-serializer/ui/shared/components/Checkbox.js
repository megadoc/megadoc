const React = require('react');
const { bool, string, func, any } = React.PropTypes;

const Checkbox = React.createClass({
  propTypes: {
    checked: bool,
    value: string,
    onChange: func,
    children: any,
  },

  render() {
    return (
      <label className="checkbox">
        <input
          type="checkbox"
          className="checkbox__indicator"
          checked={this.props.checked}
          value={this.props.value}
          onChange={this.props.onChange}
        />

        {this.props.children}
      </label>
    );
  }
});

module.exports = Checkbox;
