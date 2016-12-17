module.exports = function flattenArray(list) {
  return list.reduce(function(flatList, x) { return flatList.concat(x); }, []);
};