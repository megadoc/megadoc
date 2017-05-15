var Prism = require('prismjs');
var assign = require('lodash').assign;

function CodeRenderer(userConfig) {
  var config = assign({
    defaultLanguage: null,
    languages: [],
    aliases: {}
  }, userConfig);

  config.languages.forEach(function(name) {
    try {
      require('prismjs/components/prism-' + name);
    }
    catch(e) {
      console.warn("SyntaxHighlighter: definition for language '%s' could not be found",
        name
      );
    }
  });

  return function renderCode(code, language) {
    var languageCode = config.aliases[language] || language || config.defaultLanguage;
    var grammar = Prism.languages[languageCode];
    var html = code;

    if (grammar) {
      html = Prism.highlight(code, grammar);
    }

    return (
      '<pre class="language-' + (grammar ? languageCode : 'none') + '"><code>' +
        html +
      '</code></pre>'
    );
  };
}

module.exports = CodeRenderer;