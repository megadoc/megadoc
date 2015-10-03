const React = require('react');
const { bool, string, func, any } = React.PropTypes;

const Radio = React.createClass({
  propTypes: {
    checked: bool,
    value: string,
    onChange: func,
    children: any,
  },

  render() {
    return (
      <label className="radio">
        <input
          type="radio"
          className="radio__indicator"
          checked={this.props.checked}
          value={this.props.value}
          onChange={this.props.onChange}
        />

        {this.props.children}
      </label>
    );
  }
});


module.exports = Radio;