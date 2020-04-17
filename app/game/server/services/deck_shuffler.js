DeckShuffler = class DeckShuffler {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  shuffle(source = 'discard', cards) {
    if (!cards) {
      cards = this.player_cards[source]
    }
    cards = this.remove_stashes(cards)
    this.put_cards_in_deck(source, cards)
    this.shuffle_deck()
    if (!_.isEmpty(this.stashes)) {
      this.insert_stashes()
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
    _.each(cards, (card) => {
      let card_mover = new CardMover(this.game, this.player_cards)
      card_mover.move(this.player_cards[source], this.player_cards.deck, card)
    })
  }

  shuffle_deck() {
    this.player_cards.deck = _.shuffle(this.player_cards.deck)
  }

  insert_stashes() {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> shuffles their deck`)
    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
    _.each(this.stashes, function(stash) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'overpay',
        player_cards: true,
        instructions: `Choose where in your deck to put ${CardView.render(stash)} (1 is top of deck):`,
        minimum: 1,
        maximum: _.size(this.player_cards.deck) + 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, stash)
      turn_event_processor.process(DeckShuffler.insert_stash)
    })
  }

  static insert_stash(game, player_cards, location, stash) {
    location = Number(location)
    player_cards.deck.splice(location-1, 0, stash)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> inserts ${CardView.render(stash)} as card #${location}`)
    GameModel.update(game._id, game)
  }

}
