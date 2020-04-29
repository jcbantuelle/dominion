import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

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
