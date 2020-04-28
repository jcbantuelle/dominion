Meteor.startup(function () {
  Meteor.settings.public.image_url = process.env.IMAGE_URL
})
