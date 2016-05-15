const TwoColumnLayout = require('components/TwoColumnLayout');

megadoc.use('megadoc-theme-qt', function ThemeQt(api, configs) {
  if (configs.some(x => x.invertedSidebar)) {
    TwoColumnLayout.invert();
  }
});