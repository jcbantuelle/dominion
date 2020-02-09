Priest = class Priest extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 4
    }

    play(game, player_cards) {
        let gained_coins = CoinGainer.gain(game, player_cards, 2)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

        if (_.size(player_cards.hand) > 0) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose a card to trash:',
                cards: player_cards.hand,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Priest.trash_card)
        } else {
            game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
        }

        game.turn.priests += 1
    }

    static trash_card(game, player_cards, selected_cards) {
        let trashed_card = selected_cards[0]
        let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_card.name)
        card_trasher.trash()
    }

}
