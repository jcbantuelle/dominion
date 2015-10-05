Meteor.methods({
  validate_signup_form: function(email, username, password, confirm) {
    let errors = {}

    if (!email) {
      errors.email = 'Email required'
    }

    if (!username) {
      errors.username = 'Username required'
    } else if(Meteor.users.findOne({username: username})) {
      errors.username = 'Username is already in use'
    }

    if (!password) {
      errors.password = 'Password required'
    }

    if (confirm !== password) {
      errors.confirm = 'Passwords do not match'
    }

    return errors
  }
})
