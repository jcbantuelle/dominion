Template.ForgotPassword.events({
  'submit #forgotPasswordForm': function(e, t) {
    e.preventDefault()

    var forgotPasswordForm = $(e.currentTarget)
    var email = _.trim(forgotPasswordForm.find('#forgotPasswordEmail').val().toLowerCase())

    if (!_.isEmpty(email)) {

      Accounts.forgotPassword({email: email}, function(err) {
        if (err) {
          if (err.message === 'User not found [403]') {
            alert('This email does not exist.')
          } else {
            alert('We are sorry but something went wrong.')
          }
        } else {
          alert('Email Sent. Check your mailbox.')
        }
      })

    }
    return false
  }
})
