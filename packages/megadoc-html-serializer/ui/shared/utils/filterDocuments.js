const alwaysTrue = () => true

module.exports = function filterDocuments(filters) {
  if (!filters || !filters.length) {
    return alwaysTrue
  }

  return function applyDocumentFilter(node) {
    return filters.every(filter => {
      if (filter.name) {
        return node.id.match(filter.name)
      }
      else if (filter.filePath) {
        return node.filePath.match(filter.filePath)
      }
      else {
        return false;
      }
    })
  }
}