const AppState = require('core/AppState');

megadoc.useTheme('megadoc-theme-qt', function ThemeQt(themeOptions) {
  if (themeOptions.invertedSidebar) {
    AppState.invertTwoColumnLayout();
  }
});