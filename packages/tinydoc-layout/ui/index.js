const React = require('react');
const LayoutComponent = require('./components/Layout');

tinydoc.outlets.define('Layout::Banner');
tinydoc.outlets.define('Layout::Content');
tinydoc.outlets.define('Layout::Sidebar');

tinydoc.use('tinydoc-layout', function Layout(api, configs) {
  tinydoc.outlets.add('Layout', {
    key: 'Layout',
    component: React.createClass({
      render() {
        return <LayoutComponent {...this.props} config={configs[0]} />
      }
    })
  });
});