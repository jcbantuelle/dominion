Router.route('/login')
Router.route('/signup')
Router.route('/approval')
Router.route('/accounts')

Router.route('/lobby')
Router.route('/game/:id', {
  name: 'game'
})
Router.route('/game_history', {
  name: 'game_history_listing'
})
Router.route('/game_history/:id', {
  name: 'game_history_show'
})

Router.route('/', function() {
  this.redirect('/lobby')
})
