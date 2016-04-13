const React = require("react");
const Banner = require('components/Banner');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const scrollToTop = require('utils/scrollToTop');

const { node } = React.PropTypes;

const MultiPageLayout = React.createClass({
  propTypes: {
    children: node
  },

  componentDidMount() {
    TwoColumnLayout.on('change', this.reload);
    scrollToTop();
  },

  componentWillUnmount() {
    TwoColumnLayout.off('change', this.reload);
  },

  render() {
    var className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': TwoColumnLayout.isActive()
    });

    return (
      <div className={className}>
        <Banner />

        <div className="root__screen">
          {this.props.children}
        </div>
      </div>
    );
  },

  reload() {
    this.forceUpdate();
  },
});

module.exports = MultiPageLayout;