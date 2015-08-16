var React = require('react');
var Database = require('core/Database');
var ClassView = require('./ClassView');
var HasTitle = require('mixins/HasTitle');

var Class = React.createClass({
  mixins: [
    HasTitle(function() {
      var module = Database.getModule(this.props.params.moduleId);
      if (module) {
        return `[JS] ${module.ctx.name}`;
      }
    })
  ],

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