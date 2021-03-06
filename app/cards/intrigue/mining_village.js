MiningVillage = class MiningVillage extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let mining_village = _.find(player_cards.in_play, function(card) {
      return card.id === card_player.card.id
    })

    if (mining_village) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Trash ${CardView.render(mining_village)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let response = turn_event_processor.process(MiningVillage.trash_card)

      if (response === 'yes') {
        let card_trasher = new CardTrasher(game, player_cards, 'in_play', mining_village)
        card_trasher.trash()

        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(2)
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to trash ${CardView.render(mining_village)}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(this)} is no longer in play`)
    }
  }

  static trash_card(game, player_cards, response) {
    return response
  }

}
