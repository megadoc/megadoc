const React = require('react');
const { bool, string, func, any } = React.PropTypes;

const Radio = React.createClass({
  propTypes: {
    checked: bool,
    value: string,
    onChange: func,
    children: any,
    className: string,
    name: string,
  },

  render() {
    return (
      <label className={`${this.props.className || ''} radio`}>
        <input
          type="radio"
          className="radio__indicator"
          checked={this.props.checked}
          name={this.props.name}
          value={this.props.value}
          onChange={this.props.onChange}
        />

        {this.props.children}
      </label>
    );
  }
});


module.exports = Radio;