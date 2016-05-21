var RE = new RegExp('\s*([^=]+)=(.+)\s*');

module.exports = function extractDefaultValue(string) {
  if (string[0] === '[' && string[string.length-1] === ']') {
    if (string.slice(1,-1).match(RE)) {
      return { name: RegExp.$1.trim(), defaultValue: RegExp.$2.trim() };
    }
    else {
      return {
        name: string.slice(1,-1).trim(),
        defaultValue: null
      }
    }
  }

  return null;
};