Router.route('/login')
Router.route('/signup')
Router.route('/approval')
Router.route('/accounts')
Router.route('/active_games')

Router.route('/forgot-password')
Router.route('/reset-password/:token', {
  name: 'reset_password'
})

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
Router.route('/players', {
  name: 'players_listing'
})
Router.route('/players/:id', {
  name: 'players_show'
})

Router.route('/', function() {
  this.redirect('/lobby')
})
