exports.apply = function(node) {
  if (node.filePath) {
    node.filePath = ensureLeadingSlash(node.filePath);
  }
};

function ensureLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}
