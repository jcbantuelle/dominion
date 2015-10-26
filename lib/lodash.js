Meteor.startup(function () {
  _ = lodash

  _.titleize = function(text) {
    return _.startCase(text).replace(/ /g,'')
  }
})
