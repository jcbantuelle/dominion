Router.configure({
  layoutTemplate: 'layout'
})

function login_required() {
  if (!Meteor.userId()) {
    Router.go('login')
  } else {
    this.next()
  }
}
Router.onBeforeAction(login_required, {except: ['login', 'signup']})

Router.route('login')
Router.route('signup')

Router.route('lobby')

Router.route('home', {
  path: '/',
  action: function() {
    Router.go('lobby')
  }
})
