Template.layout.events({

  'click .js-logout': function() {
    Meteor.logout(function() {
      Router.go('/')
    })
  }

})
