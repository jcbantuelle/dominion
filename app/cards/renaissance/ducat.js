Ducat = class Ducat extends Card {

    types() {
        return ['treasure']
    }

    coin_cost() {
        return 2
    }

    play(game, player_cards) {
        if (game.turn.possessed) {
            possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
            possessing_player_cards.coin_tokens += 1
            game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes a coin token`)
            PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
            player_cards.coin_tokens += 1
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes a coin token`)
        }

        game.turn.buys += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
    }

    gain_event(buyer) {
        let player_cards = buyer.player_cards
        let game = buyer.game

        let has_copper = _.some(player_cards.hand, function (card) {
            return card.name === 'Copper'
        })

        if (has_copper) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: game.turn.player._id,
                username: game.turn.player.username,
                type: 'choose_yes_no',
                instructions: `Trash a ${CardView.card_html('treasure', 'Copper')}?`,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Ducat.trash_copper)
        } else {
            game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.card_html('treasure', 'Copper')}`)
        }
    }

    static trash_copper(game, player_cards, response) {
        if (response === 'yes') {
            let card_trasher = new CardTrasher(game, player_cards, 'hand', 'Copper')
            card_trasher.trash()
        } else {
            game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.card_html('treasure', 'Copper')}`)
        }
    }

}
