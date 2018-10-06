Treasurer = class Treasurer extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 5
    }

    static artifact_name() {
        return 'Key'
    }

    static get_artifact_instance() {
        return new Key()
    }

    play(game, player_cards) {
        let gained_coins = CoinGainer.gain(game, player_cards, 3)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

        let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_options',
            instructions: `Choose One:`,
            minimum: 1,
            maximum: 1,
            options: [
                { text: 'Trash Treasures from hand', value: 'trash' },
                { text: 'Gain Treasure from trash', value: 'gain' },
                { text: 'take the Key', value: 'artifact' }
            ]
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Treasurer.process_response)

    }

    static process_response(game, player_cards, response) {
        response = response[0]
        if (response === 'artifact') {
            Treasurer.get_artifact(game, player_cards)
        } else if (response === 'trash') {
            Treasurer.trash_treasure(game, player_cards)
        } else if (response === 'gain') {
            Treasurer.gain_tresure_from_trash(game, player_cards)
        }
    }

    static gain_tresure_from_trash(game, player_cards) {
        let eligible_cards = _.filter(game.trash, function (card) {
            return _.includes(_.words(card.types), 'treasure')
        })

        if (_.size(eligible_cards) > 1) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                instructions: 'Choose a tresure to gain:',
                cards: eligible_cards,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Treasurer.gain_from_trash)
        } else if (_.size(eligible_cards) === 1) {
            Treasurer.gain_from_trash(game, player_cards, eligible_cards)
        } else {
            game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
    }

    static gain_from_trash(game, player_cards, selected_cards) {
        let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
        card_gainer.gain_trash_card()
    }

    static trash_treasure(game, player_cards) {
        let eligible_cards = _.filter(player_cards.hand, function (card) {
            return _.includes(_.words(card.types), 'treasure')
        })
        if (_.size(eligible_cards) > 0) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose a treasure to trash:',
                cards: eligible_cards,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Treasurer.trash_card)
        } else {
            game.log.push(`&nbsp;&nbsp;but does not have any treasures in hand`)
        }
    }

    static trash_card(game, player_cards, selected_cards) {
        let selected_card = selected_cards[0]

        let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
        card_trasher.trash()
    }

    static get_artifact(game, player_cards) {
        let artifact_index = _.findIndex(player_cards.artifacts, function (artifact) {
            return artifact.name === Treasurer.artifact_name()
        })

        if (artifact_index === -1) {
            let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
            ordered_player_cards.shift()

            _.each(ordered_player_cards, function (other_player_cards) {
                let other_player_artifact_index = _.findIndex(other_player_cards.artifacts, function (artifact) {
                    return artifact.name === Treasurer.artifact_name()
                })
                if (other_player_artifact_index !== -1) {
                    other_player_cards.artifacts.splice(other_player_artifact_index, 1)
                }
                PlayerCardsModel.update(game._id, other_player_cards)
            })

            let artifact = (Treasurer.get_artifact_instance()).to_h()
            player_cards.artifacts.push(artifact)
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(artifact, true)}`)
        }
    }


}
