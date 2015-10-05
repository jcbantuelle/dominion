Router.configure({
  layoutTemplate: 'layout'
})

function login_required() {
  if (!Meteor.userId()) {
    this.redirect('login')
  } else {
    this.next()
  }
}
Router.onBeforeAction(login_required, {except: ['login', 'signup']})

Router.route('/login')
Router.route('/signup')

Router.route('/lobby')

Router.route('/', function() {
  this.redirect('/lobby')
})
