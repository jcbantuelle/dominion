CharmEventsProcessor = class CharmEventsProcessor {

  constructor(buyer) {
    this.buyer = buyer
    this.bought_card_name = this.buyer.card.name()
    this.bought_card = this.buyer.card.to_h()
    if (this.bought_card_name === 'Estate' && this.buyer.player_cards.tokens.estate) {
      this.bought_card_name = this.buyer.player_cards.tokens.estate.name
      this.bought_card = ClassCreator.create('Inherited Estate').to_h(this.buyer.player_cards)
    }
  }

  process() {
    if (this.buyer.game.turn.charms > 0) {
      _.times(this.buyer.game.turn.charms, () => {
        let eligible_cards = _.filter(this.buyer.game.cards, (card) => {
          return card.count > 0 && card.top_card.purchasable && card.top_card.name != this.bought_card_name && CardCostComparer.card_equal_to(this.buyer.game, card.top_card, this.bought_card)
        })
        if (_.size(eligible_cards) > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.buyer.game._id,
            player_id: this.buyer.player_cards.player_id,
            username: this.buyer.player_cards.username,
            type: 'choose_cards',
            game_cards: true,
            instructions: 'Choose a card to gain (or none to skip):',
            cards: eligible_cards,
            minimum: 0,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(this.buyer.game, this.buyer.player_cards, turn_event_id)
          turn_event_processor.process(CharmEventsProcessor.gain_card)
        } else {
          this.buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.render(new Charm())}`)
        }
      })
      this.buyer.game.turn.charms = 0
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to gain a card from ${CardView.render(new Charm())}`)
    }
    GameModel.update(game._id, game)
  }

}
