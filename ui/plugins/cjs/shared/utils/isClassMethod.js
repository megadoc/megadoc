module.exports = function(doc) {
  return [
    'method',
    'function',
    'declaration'
  ].indexOf(doc.ctx.type) > -1;
};
