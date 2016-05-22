const AppState = require('core/AppState');
const config = require('config');

megadoc.use('megadoc-theme-qt', function ThemeQt() {
  if (config.pluginConfigs['megadoc-theme-qt'].some(x => x.invertedSidebar)) {
    AppState.invertTwoColumnLayout();
  }
});