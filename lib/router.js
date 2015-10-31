Router.route('/login')
Router.route('/signup')

Router.route('/lobby')
Router.route('/game/:id', {
  name: 'game'
})

Router.route('/', function() {
  this.redirect('/lobby')
})
