const SectionJumperMixin = require('mixins/SectionJumperMixin');

module.exports = SectionJumperMixin(function() {
  const id = this.props.focusedEntity;

  if (id) {
    const groups = Object.keys(this.refs);

    for (let i = 0; i < groups.length; ++i) {
      const groupKey = groups[i];
      const child = this.refs[groupKey].getItem(this.props.focusedEntity);

      if (child) {
        return child;
      }
    }

    console.warn('waaah, unable to find entity to jump to:', id);
  }
});