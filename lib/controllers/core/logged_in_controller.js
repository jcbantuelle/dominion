LoggedInController = ApplicationController.extend({

  onBeforeAction: function () {
    if (!Meteor.userId()) {
      this.redirect('login')
    } else {
      this.next()
    }
  }

})
