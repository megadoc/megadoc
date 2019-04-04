const React = require('react');
const { PropTypes } = React;

const DocumentTitle = React.createClass({
  propTypes: {
    scope: PropTypes.object({
      documentEntityNode: PropTypes.object,
      documentNode: PropTypes.object,
      namespaceNode: PropTypes.object,
    })
  },

  componentDidMount() {
    this.applyTitle(this.props)
  },

  componentWillReceiveProps(nextProps) {
    this.applyTitle(nextProps)
  },

  render() {
    return null
  },

  applyTitle(props) {
    const { scope } = props

    let title = []

    if (scope && scope.documentEntityNode) {
      title.push(scope.documentEntityNode.title)
    }

    if (scope && scope.documentNode) {
      title.push(scope.documentNode.title)
    }

    title = title.filter(x => !!x)

    if (title.length) {
      this.previousTitle = document.title
      document.title = title.join(' - ')
    }
    else {
      document.title = this.previousTitle
    }
  }
});

module.exports = DocumentTitle;
