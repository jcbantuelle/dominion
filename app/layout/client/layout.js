import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.layout.onCreated(function() {
  Streamy.on('account_inactivated', function() {
    FlowRouter.go(`/approval`)
  })
})

Template.layout.events({
  'click .js-logout': function() {
    Meteor.logout(function() {
      FlowRouter.go('/')
    })
  },
  'click .nav-link, click .navbar-brand': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  },
  'click': function() {
    $('.popover').remove()
  }
})
