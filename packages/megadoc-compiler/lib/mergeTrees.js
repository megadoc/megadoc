const R = require('ramda');
const filePathOf = partition => partition[0].filePath;

module.exports = function mergeTrees(prevCompilation, nextCompilation) {
  const changedFiles = R.indexBy(R.identity, nextCompilation.files);
  const prevPartitions = (
    R.groupWith((a, b) => a.filePath === b.filePath, prevCompilation.rawDocuments)
  )

  const nextPartitions = (
    R.groupWith((a, b) => a.filePath === b.filePath, nextCompilation.rawDocuments)
  )

  const withUpdatedPartitions = prevPartitions.reduce(function(list, partition) {
    const filePath = filePathOf(partition);

    if (changedFiles[filePath]) {
      const updatedPartition = nextPartitions.filter(x => filePathOf(x) === filePath)[0] || [];
      return list.concat(updatedPartition);
    }
    else {
      return list.concat(partition);
    }
  }, []);

  return {
    rawDocuments: withUpdatedPartitions,
  };
};
