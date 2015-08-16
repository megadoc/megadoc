var React = require('react');
var Database = require('core/Database');
var ClassView = require('./ClassView');

var Class = React.createClass({
  statics: {
    willTransitionTo(transition, params) {
      if (!Database.getModule(params.moduleId)) {
        transition.redirect('js');
      }
    }
  },

  render() {
    var { moduleId } = this.props.params;

    return (
      <ClassView
        commonPrefix={Database.getCommonPrefix()}
        classDoc={Database.getModule(moduleId)}
        classDocs={Database.getModuleTags(moduleId)}
        focusedEntity={this.props.query.entity}
      />
    );
  }
});

module.exports = Class;