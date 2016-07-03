ResetPasswordController = AuthenticationController.extend({

  onBeforeAction: function() {
    Accounts._resetPasswordToken = this.params.token
    this.next()
  }
})
