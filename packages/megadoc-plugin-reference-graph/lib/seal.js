module.exports = function({ edgeGraph }, node) {
  const edges = edgeGraph[node.uid] || []

  return edges.filter(x => x[0] === 'i').map(x => x[1])
};