module.exports = function(documentNode) {
  const tree = documentNode.entities.reduce(function(map, x, i) {
    const myLevel = x.properties.level;
    const parents = documentNode.entities.slice(0, i).filter(y => y.properties.level < myLevel);
    let closestParent;

    parents.forEach(function(y) {
      if (!closestParent || y.properties.level >= closestParent.properties.level) {
        closestParent = y;
      }
    });

    if (closestParent) {
      map[closestParent.uid] = map[closestParent.uid] || {
        node: closestParent,
        children: []
      };

      map[closestParent.uid].children.push(x);
    }
    else {
      map[x.uid] = map[x.uid] || { root: true, node: x, children: [] };
    }

    return map;
  }, {});

  return Object.keys(tree).map(x => tree[x]).sort(function(a,b) {
    if (a.node.properties.level > b.node.properties.level) {
      return 1;
    }
    else {
      return -1;
    }
  });
}
