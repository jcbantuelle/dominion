AuthenticationController = ApplicationController.extend({

  onBeforeAction: function () {
    if (Meteor.userId()) {
      if (Meteor.user().current_game) {
        this.redirect(`/game/${Meteor.user().current_game}`)
      } else {
        this.redirect('lobby')
      }
    } else {
      this.next()
    }
  }

})
