function AsyncPrinter({ print, frequency = 100 }) {
  let scheduler = null

  const buffer = []
  const drain = () => { print(buffer.splice(0)) }
  const schedule = () => {
    if (scheduler) {
      clearTimeout(scheduler)
    }

    scheduler = setTimeout(drain, frequency)
  }

  return {
    add: item => {
      buffer.push(item)
      schedule()
    },
  }
}

function SyncPrinter({ print }) {
  return {
    add: item => {
      print([ item ])
    }
  }
}

exports.AsyncPrinter = AsyncPrinter
exports.SyncPrinter = SyncPrinter