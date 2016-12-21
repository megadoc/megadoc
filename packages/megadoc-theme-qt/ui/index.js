module.exports = {
  type: 'theme',
  name: 'megadoc-theme-qt',
  register: function(themeOptions, appState) {
    if (themeOptions.invertedSidebar) {
      appState.invertTwoColumnLayout();
    }
  }
};
