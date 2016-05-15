const TwoColumnLayout = require('components/TwoColumnLayout');

tinydoc.use('tinydoc-theme-qt', function ThemeQt(api, configs) {
  if (configs.some(x => x.invertedSidebar)) {
    TwoColumnLayout.invert();
  }
});