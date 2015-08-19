var SectionJumperMixin = require('mixins/SectionJumperMixin');

module.exports = SectionJumperMixin(function() {
  var id = this.props.focusedEntity;

  if (id) {
    var groups = Object.keys(this.refs);

    for (var i = 0; i < groups.length; ++i) {
      var groupKey = groups[i];
      var child = this.refs[groupKey].getItem(this.props.focusedEntity);

      if (child) {
        return child;
      }
    }

    console.warn('waaah, unable to find entity to jump to:', id);
  }
});