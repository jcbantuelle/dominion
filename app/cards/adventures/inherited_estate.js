InheritedEstate = class InheritedEstate extends Card {

  name() {
    return 'Estate'
  }

  inherited_name(player_cards) {
    return player_cards.tokens.estate.name
  }

  types(player_cards) {
    return player_cards.tokens.estate.types.split(' ').concat('victory')
  }

  image() {
    return 'estate'
  }

  coin_cost() {
    return 2
  }

  victory_points() {
    return 1
  }

  play(game, player_cards, player) {
    return ClassCreator.create(player_cards.tokens.estate.name).play(game, player_cards, player)
  }

  attack_event(game, player_cards, card_id) {
    return ClassCreator.create(player_cards.tokens.estate.name).attack_event(game, player_cards, card_id)
  }

  start_turn_event(game, player_cards, card) {
    return ClassCreator.create(player_cards.tokens.estate.name).start_turn_event(game, player_cards, card)
  }

  discard_event(discarder) {
    return ClassCreator.create(discarder.player_cards.tokens.estate.name).discard_event(discarder, 'Estate')
  }

  gain_event(gainer) {
    return ClassCreator.create(gainer.player_cards.tokens.estate.name).gain_event(gainer, 'Estate')
  }

  gain_reaction(game, player_cards, gainer) {
    return ClassCreator.create(player_cards.tokens.estate.name).gain_reaction(game, player_cards, gainer)
  }

  reserve(game, player_cards) {
    return ClassCreator.create(player_cards.tokens.estate.name).reserve(game, player_cards, 'Estate')
  }

  end_buy_event(game, player_cards) {
    return ClassCreator.create(player_cards.tokens.estate.name).end_buy_event(game, player_cards, 'Estate')
  }

  action_resolution_event(game, player_cards, resolved_action) {
    return ClassCreator.create(player_cards.tokens.estate.name).action_resolution_event(game, player_cards, resolved_action, 'Estate')
  }

  would_gain_reaction(game, player_cards, gainer) {
    return ClassCreator.create(player_cards.tokens.estate.name).would_gain_reaction(game, player_cards, gainer, 'Estate')
  }

  buy_event(buyer) {
    return ClassCreator.create(buyer.player_cards.tokens.estate.name).buy_event(buyer, 'Estate')
  }

  trash_reaction(game, player_cards, trasher) {
    return ClassCreator.create(player_cards.tokens.estate.name).trash_reaction(game, player_cards, trasher, 'Estate')
  }

  trash_event(trasher) {
    return ClassCreator.create(trasher.player_cards.tokens.estate.name).trash_event(trasher, 'Estate')
  }

}
