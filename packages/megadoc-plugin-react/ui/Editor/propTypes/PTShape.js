const React = require('react');
const PropType = require('../PropType');
const { func, string, arrayOf, shape } = React.PropTypes;

const PTShape = React.createClass({
  statics: {
    containerTagName: 'div',
  },

  propTypes: {
    getValue: func,
    getDescription: func,
    onChange: func,
    path: string,

    propType: shape({
      name: string,
      type: string,
      types: arrayOf(shape({
        name: string,
        type: string
      }))
    })
  },

  render() {
    return (
      <div className="react-editor__prop--shape">
        {this.props.propType.properties.map((propType) => {
          return (
            <PropType
              key={propType.name}
              path={this.props.path}
              onChange={this.props.onChange}
              getValue={this.props.getValue}
              getDescription={this.props.getDescription}
              propType={propType}
            />
          );
        })}
      </div>
    );
  }
});

module.exports = PTShape;
