LoggedInController = ApplicationController.extend({

  onBeforeAction: function () {
    if (!Meteor.userId()) {
      this.redirect('login')
    } else if (!Meteor.user().approved || Meteor.user().disabled) {
      this.redirect('approval')
    } else {
      this.next()
    }
  }

})
