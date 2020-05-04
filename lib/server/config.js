Meteor.startup(function () {
  Meteor.users.update({}, {$unset: {current_game: ''}}, {multi: true})

  Meteor.settings.public.image_url = process.env.IMAGE_URL

  if (process.env.ROLLBAR_ACCESS_TOKEN) {
    var Rollbar = require("rollbar")
    var rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true
    })

    const originalMeteorDebug = Meteor._debug
    Meteor._debug = (message, stack) => {
      rollbar.log(message, stack)
      originalMeteorDebug(message, stack)
    }
  }

  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl('reset-password/' + token)
  }
})
