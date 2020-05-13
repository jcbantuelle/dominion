import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

function redirect_if_not_logged_in(params, redirect) {
  if (!Meteor.userId()) {
    redirect('/login')
  } else if (!Meteor.user().approved || Meteor.user().disabled) {
    if (FlowRouter.current().path !== '/approval') {
      redirect('/approval')
    }
  }
}

function redirect_if_not_admin(params, redirect) {
  if (!Meteor.user().admin) {
    redirect('/lobby')
  }
}

function redirect_if_logged_in(params, redirect) {
  if (Meteor.userId()) {
    if (Meteor.user().current_game) {
      redirect(`/game/${Meteor.user().current_game}`)
    } else {
      redirect('/lobby')
    }
  }
}

const all_routes = FlowRouter.group({
  whileWaiting() {
    this.render('loading')
  },
  waitOn() {
    return [Meteor.subscribe('players')]
  }
})

const logged_in_routes = all_routes.group({
  triggersEnter: [redirect_if_not_logged_in]
})

const not_logged_in_routes = all_routes.group({
  triggersEnter: [redirect_if_logged_in]
})

const admin_routes = all_routes.group({
  triggersEnter: [redirect_if_not_logged_in, redirect_if_not_admin]
})

not_logged_in_routes.route('/login', {
  action() {
    this.render('layout', 'login')
  }
})

not_logged_in_routes.route('/signup', {
  action() {
    this.render('layout', 'signup')
  }
})

not_logged_in_routes.route('/forgot-password', {
  action() {
    this.render('layout', 'ForgotPassword')
  }
})

not_logged_in_routes.route('/reset-password/:token', {
  action() {
    this.render('layout', 'ResetPassword')
  }
})

logged_in_routes.route('/approval', {
  action() {
    if (Meteor.user().approved && !Meteor.user().disabled) {
      FlowRouter.go('/lobby')
    } else {
      this.render('layout', 'approval')
    }
  }
})

admin_routes.route('/active_games', {
  waitOn() {
    return [Meteor.subscribe('all_games')]
  },
  action() {
    this.render('layout', 'activeGames')
  }
})

admin_routes.route('/accounts', {
  action() {
    this.render('layout', 'accounts')
  }
})

logged_in_routes.route('/lobby', {
  triggersEnter: [function() {
    Meteor.call('setLobbyStatus')
  }],
  waitOn() {
    return [
      Meteor.subscribe('proposal'),
      Meteor.subscribe('game_history')
    ]
  },
  action() {
    if (Meteor.user().current_game) {
      FlowRouter.go(`/game/${Meteor.user().current_game}`)
    } else {
      this.render('layout', 'lobby')
    }
  },
  triggersExit: [function() {
    Meteor.call('unsetLobbyStatus')
  }]
})

logged_in_routes.route('/game/:id', {
  waitOn(params) {
    return [
      Meteor.subscribe('games', params.id),
      Meteor.subscribe('player_cards', params.id),
      Meteor.subscribe('turn_events', params.id)
    ]
  },
  action() {
    if (!Games.findOne({})) {
      FlowRouter.go(`/lobby`)
    } else {
      this.render('layout', 'game')
    }
  }
})

logged_in_routes.route('/players', {
  waitOn() {
    return [Meteor.subscribe('player_rankings')]
  },
  action() {
    this.render('layout', 'playersListing')
  }
})

logged_in_routes.route('/players/:id', {
  waitOn(params, qs) {
    return [
      Meteor.subscribe('player_rankings'),
      Meteor.subscribe('game_history', qs.page, params.id)
    ]
  },
  action() {
    this.render('layout', 'playersShow')
  }
})

logged_in_routes.route('/game_history', {
  waitOn(params, qs) {
    return [Meteor.subscribe('game_history', qs.page)]
  },
  action() {
    this.render('layout', 'gameHistoryListing')
  }
})

logged_in_routes.route('/game_history/:id', {
  waitOn() {
    return [Meteor.subscribe('game_history')]
  },
  action() {
    this.render('layout', 'gameHistoryShow')
  }
})

FlowRouter.route('/', {
  triggersEnter: [function(params, redirect) {
    redirect('/lobby')
  }]
})