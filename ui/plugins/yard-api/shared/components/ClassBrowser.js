var React = require("react");
var { Link } = require('react-router');

var APIClassBrowser = React.createClass({
  render() {
    return (
      <nav>
        {this.props.objects.map(this.renderEntry)}
      </nav>
    );
  },

  renderEntry(object) {
    var id = object.object;

    if (!id) { return null; }

    return (
      <div key={id} className="class-browser__entry">
        <Link
          to="api.class"
          params={{ classId: id }}
          children={id}
          className="class-browser__entry-link" />
      </div>
    );
  }
});

module.exports = APIClassBrowser;