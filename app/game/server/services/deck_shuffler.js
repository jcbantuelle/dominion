DeckShuffler = class DeckShuffler {

  constructor(game, player_cards, cards_so_far) {
    this.game = game
    this.player_cards = player_cards
    this.cards_so_far = cards_so_far
  }

  shuffle(source = 'discard', cards) {
    if (!cards) {
      cards = this.player_cards[source]
    }
    cards = this.remove_stashes(cards)
    this.put_cards_in_deck(source, cards)
    this.shuffle_deck()
    this.star_chart()
    if (!_.isEmpty(this.stashes)) {
      this.insert_stashes(source)
    }
  }

  remove_stashes(cards) {
    this.stashes = _.filter(cards, (card) => {
      return card.name === 'Stash'
    })
    return _.filter(cards, (card) => {
      return card.name !== 'Stash'
    })
  }

  put_cards_in_deck(source, cards) {
    _.each(_.clone(cards), (card) => {
      let card_mover = new CardMover(this.game, this.player_cards)
      card_mover.move(this.player_cards[source], this.player_cards.deck, card)
    })
  }

  shuffle_deck() {
    this.player_cards.deck = _.shuffle(this.player_cards.deck)
  }

  star_chart() {
    this.star_chart_card = _.find(this.player_cards.projects, (project) => {
      return project.name === 'Star Chart'
    })
    if (this.star_chart_card) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> shuffles their deck`)
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put on top of your deck: (or none to skip)',
        cards: _.shuffle(this.player_cards.deck),
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      let chosen_card = turn_event_processor.process(DeckShuffler.choose_card)

      if (!_.isEmpty(chosen_card)) {
        let card_mover = new CardMover(this.game, this.player_cards)
        card_mover.move(this.player_cards.deck, this.player_cards.deck, chosen_card[0])
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> puts a card on top of their deck from ${CardView.render(this.star_chart_card)}`)
      }
    }
  }

  insert_stashes(source) {
    if (!this.star_chart_card) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> shuffles their deck`)
    }
    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
    let instructions = `Choose where in your deck to put ${CardView.render(new Stash())} (1 is top of deck):`
    if (this.cards_so_far) {
      instructions += `<br>Cards Revealed So Far: ${CardView.render(this.cards_so_far)}<br>`
    }
    _.each(this.stashes, (stash) => {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'overpay',
        player_cards: true,
        instructions: instructions,
        minimum: 1,
        maximum: _.size(this.player_cards.deck) + 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, {source: source, stash: stash})
      turn_event_processor.process(DeckShuffler.insert_stash)
    })
  }

  static choose_card(game, player_cards, selected_cards) {
    return selected_cards
  }

  static insert_stash(game, player_cards, location, params) {
    location = Number(location)
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards[params.source], player_cards.deck, params.stash, location-1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> inserts ${CardView.render(params.stash)} as card #${location}`)
    GameModel.update(game._id, game)
  }

}
