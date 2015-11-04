LoggedInController = ApplicationController.extend({

  onBeforeAction: function () {
    if (!Meteor.userId()) {
      this.redirect('login')
    } else if (!Meteor.user().approved) {
      this.redirect('approval')
    } else {
      this.next()
    }
  }

})
