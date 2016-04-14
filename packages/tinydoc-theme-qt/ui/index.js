const TwoColumnLayout = require('components/TwoColumnLayout');

tinydoc.use(function() {
  if (tinydoc.isPluginEnabled('tinydoc-layout-multi-page')) {
    TwoColumnLayout.invert();
  }
});