LoggedInAdminController = ApplicationController.extend({

  onBeforeAction: function () {
    if (!Meteor.userId()) {
      this.redirect('login')
    } else if (!Meteor.user().admin) {
      this.redirect('lobby')
    } else {
      this.next()
    }
  }

})
