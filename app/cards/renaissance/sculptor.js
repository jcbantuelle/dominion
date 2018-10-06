Sculptor = class Sculptor extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 5
    }

    play(game, player_cards) {
        let eligible_cards = _.filter(game.cards, function (card) {
            return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 5)
        })

        if (_.size(eligible_cards) > 0) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                game_cards: true,
                instructions: 'Choose a card to gain:',
                cards: eligible_cards,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Sculptor.gain_card)
        } else {
            game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
    }

    static gain_card(game, player_cards, selected_cards) {
        let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
        card_gainer.gain_game_card()

        if (_.includes(_.words(selected_cards[0].top_card.types), 'treasure')) {

            if (game.turn.possessed) {
                possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
                possessing_player_cards.villagers += 1
                game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes a villager`)
                PlayerCardsModel.update(game._id, possessing_player_cards)
            } else {
                player_cards.villagers += 1
                game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes a villager`)
            }
        }
    }

}
