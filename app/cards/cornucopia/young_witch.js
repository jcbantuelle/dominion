YoungWitch = class YoungWitch extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 2) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Discard 2 cards:',
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(YoungWitch.discard_cards)
    } else if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  attack(game, player_cards) {
    let bane = _.find(player_cards.hand, (card) => {
      return card.bane
    })

    if (bane) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(bane)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, bane)
      turn_event_processor.process(YoungWitch.reveal_bane)
    } else {
      YoungWitch.reveal_bane(game, player_cards, 'no')
    }
  }

  static reveal_bane(game, player_cards, response, bane) {
    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand', bane)
    } else {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
      card_gainer.gain()
    }
  }

}
