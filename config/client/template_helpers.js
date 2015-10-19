Template.registerHelper('times', function (times) {
  if (times !== undefined) {
    return _.times(times, function(counter) {
      return counter
    })
  } else {
    return []
  }
})
