Meteor.startup(function () {
  Meteor.users.update({}, {$unset: {current_game: ''}}, {multi: true})

  Meteor.settings.public.image_url = process.env.IMAGE_URL

  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl('reset-password/' + token)
  }
})
