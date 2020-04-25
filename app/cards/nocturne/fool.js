Fool = class Fool extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_mover = new CardMover(game, player_cards)
    let took_lost_in_the_woods = card_mover.take_unique_card('states', 'Lost In The Woods')

    if (took_lost_in_the_woods) {

      revealed_boons = _.take(game.boons_deck, 3)
      game.boons_deck = _.drop(game.boons_deck, 3)

      let revealed_boon_count = _.size(revealed_boons)
      if (revealed_boon_count < 3 && _.size(game.boons_discard) > 0) {
        game.boons_deck = _.shuffle(game.boons_discard)
        game.boons_discard = []
        revealed_boons = revealed_boons.concat(_.take(game.boons_deck, 3 - revealed_boon_count))
        game.boons_deck = _.drop(game.boons_deck, 3 - revealed_boon_count)
      }
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_boons)}`)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      _.times(3, () => {
        let choice = revealed_boons[0]
        if (_.size(revealed_boons) > 1) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: 'Choose which Boon to receive next:',
            cards: revealed_boons,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          choice = turn_event_processor.process(Fool.choose_boon)
        }
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(choice)}`)
        GameModel.update(game._id, game)

        let keep = ClassCreator.create(choice.name).receive(game, player_cards)
        if (keep) {
          player_cards.boons.push(choice)
        } else {
          game.boons_discard.unshift(choice)
        }
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)

        let choice_index = _.findIndex(revealed_boons, function(boon) {
          return choice.id === boon.id
        })
        revealed_boons.splice(choice_index, 1)
      })
    }
  }

  static choose_boon(game, player_cards, selected_cards) {
    return selected_cards[0]
  }

}
