const React = require('react');

megadoc.outlets.add('Meta', {
  key: 'plugin-dot',
  component: React.createClass({
    componentDidMount() {
      this.resizeCharts();
    },

    componentDidUpdate() {
      this.resizeCharts();
    },

    render() {
      return null;
    },

    resizeCharts() {
      // TODO: do at compile time
      Array.prototype.forEach.call(window.document.querySelectorAll('.plugin-dot__container svg'), node => {
        const bbox = node.getBBox();
        node.style.marginLeft = -1 * bbox.x;
        node.style.marginTop = -1 * bbox.y;

        node.setAttribute('width', bbox.width + bbox.x * 2);
        node.setAttribute('height', bbox.height + bbox.y * 2);
        node.setAttribute('preserveAspectRatio', 'xMidYMid');
      });
    }
  })
});

megadoc.use(function() {});