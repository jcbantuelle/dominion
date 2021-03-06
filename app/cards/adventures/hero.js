Hero = class Hero extends Traveller {

  types() {
    return this.capitalism_types(['action', 'traveller'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'treasure')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a treasure to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Hero.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Hero.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available treasures to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

  discard_event(discarder, hero) {
    this.choose_exchange(discarder.game, discarder.player_cards, hero, 'Champion')
  }

}
