Meteor.startup(function () {
  Meteor.settings.public.image_url = process.env.IMAGE_URL

  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl('reset-password/' + token)
  }
})
