var RE_MEGA_LINK = /(.?)\[(.+?)\]\(\)/g;

// Megadoc scheme for linking. The syntax is:
//
//     [PATH]()
//     [PATH Custom Text]
//
//     [Module]()
//     [Module#method]()
//     [Module@prop]()
//     [Module.staticMethod]()
function MegadocLinkInjector(text, renderLink) {
  return text.replace(RE_MEGA_LINK, function(original, leadingChar, srcPath) {
    var fragments, customText;
    var path = srcPath;

    // ignore links that were escaped by a leading \
    if (leadingChar === '\\') {
      return original.substr(1);
    }

    if (path.indexOf(' ') > -1) {
      fragments = path.split(' ');
      path = fragments.shift();
      customText = fragments.join(' ');
    }

    return leadingChar + renderLink({
      source: leadingChar + srcPath,
      text: customText || null,
      title: null,
      path: path
    });
  });
}

module.exports = MegadocLinkInjector;