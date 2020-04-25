ProjectBuyer = class ProjectBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.project = _.find(game.projects, (project) => {
      return project.name === card_name
    })
  }

  buy() {
    if (this.is_valid_buy()) {
      this.update_phase()
      this.update_log()
      this.update_turn()
      this.update_projects()
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (_.includes(['action', 'treasure'], this.game.turn.phase)) {
      this.game.turn.phase = 'treasure'
      let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
      start_buy_event_processor.process()
      this.game.turn.phase = 'buy'
    }
  }

  update_projects() {
    this.project.cubes.push(`<span class="${this.player_cards.color}">&block;</span>`)
    this.player_cards.projects.push(this.project)
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.project.coin_cost
  }

  is_valid_buy() {
    return this.is_debt_free() && this.has_enough_buys() && this.has_enough_money() && this.not_forbidden()
  }

  is_debt_free() {
    return this.player_cards.debt_tokens === 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    return this.game.turn.coins >= this.project.coin_cost
  }

  not_forbidden() {
    return !_.find(this.player_cards.projects, (project) => {
      return project.name === this.project.name
    })
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.project)}`)
  }

}
