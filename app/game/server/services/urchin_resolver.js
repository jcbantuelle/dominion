UrchinResolver = class UrchinResolver {

  static resolve(game, player_cards) {
    let urchins = _.filter(player_cards.in_play, function(card) {
      return card.name === 'Urchin'
    })
    if (!_.isEmpty(urchins)) {
      _.each(urchins, (urchin) => {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Trash ${CardView.render(urchin)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, urchin)
        turn_event_processor.process(UrchinResolver.trash_urchin)
      })
      PlayerCardsModel.update(game._id, player_cards)
    }
  }

  static trash_urchin(game, player_cards, response, urchin) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', urchin)
      card_trasher.trash()

      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Mercenary')
      card_gainer.gain()
    }
  }

}
