var React = require('react');
var Database = require('core/Database');
var ClassView = require('./ClassView');

var Class = React.createClass({
  statics: {
    willTransitionTo(transition, params) {
      if (!Database.getClass(params.classId)) {
        transition.redirect('js');
      }
    }
  },

  render() {
    var { classId } = this.props.params;

    return (
      <ClassView
        commonPrefix={Database.getCommonPrefix()}
        classDoc={Database.getClass(classId)}
        classDocs={Database.getTagsForClass(classId)}
        focusedEntity={this.props.query.entity}
      />
    );
  }
});

module.exports = Class;