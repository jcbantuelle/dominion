import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

const FORM_ERRORS = 'signupErrors'

Template.signup.onCreated(function() {
  Session.set(FORM_ERRORS, {})
})

Template.signup.helpers({
  errorMessages: function() {
    return _.values(Session.get(FORM_ERRORS))
  }
})

Template.signup.events({
  'submit': function(event, template) {
    event.preventDefault()

    let [email, username, password, confirm] = form_fields(template)

    Meteor.call('validate_signup_form', email, username, password, confirm, function(error, validation_errors) {
      Session.set(FORM_ERRORS, validation_errors)
      if (!has_errors()) {
        create_account(email, username, password)
      }
    })
  },
  'click a': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  }
})

function form_fields(template) {
  return [
    template.$('[name=email]').val(),
    template.$('[name=username]').val(),
    template.$('[name=password]').val(),
    template.$('[name=confirm]').val()
  ]
}

function create_account(email, username, password) {
  Accounts.createUser({
      email: email,
      username: username,
      password: password
    }, function(error) {
      if (error) {
        Session.set(FORM_ERRORS, {'none': error.reason})
      } else {
        Meteor.call('create_player_ranking', username)
        FlowRouter.go('/')
      }
    }
  )
}

function has_errors() {
  return errors_count() !== 0
}

function errors_count() {
  return _.keys(Session.get(FORM_ERRORS)).length
}
