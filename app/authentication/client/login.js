const FORM_ERRORS = 'loginErrors'

Template.login.onCreated(function() {
  Session.set(FORM_ERRORS, {})
})

Template.login.helpers({
  errorMessages: function() {
    return _.values(Session.get(FORM_ERRORS))
  }
})

Template.login.events({
  'submit': function(event, template) {
    event.preventDefault()

    let [email, password] = form_fields(template)

    if (validate_form(email, password)) {
      if (login(email, password)) {
        Router.go('home')
      }
    }
  }
})

function form_fields(template) {
  return [
    template.$('[name=email]').val(),
    template.$('[name=password]').val()
  ]
}

function validate_form(email, password) {
  let errors = {}

  if (!email) {
    errors.email = 'Email is required'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  Session.set(FORM_ERRORS, errors)
  return !has_errors()
}

function login(email, password) {
  Meteor.loginWithPassword(email, password, function(error) {
    if (error) {
      Session.set(FORM_ERRORS, {'none': error.reason})
    }
  })
  return !has_errors()
}

function has_errors() {
  return errors_count() !== 0
}

function errors_count() {
  return _.keys(Session.get(FORM_ERRORS)).length
}
