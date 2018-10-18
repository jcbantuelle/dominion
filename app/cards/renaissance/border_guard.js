BorderGuard = class BorderGuard extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 1
    }

    play(game, player_cards) {
        game.turn.actions += 1
        let cards_to_reveal = 2

        if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
        } else {
            player_cards.revealed = _.take(player_cards.deck, cards_to_reveal)
            player_cards.deck = _.drop(player_cards.deck, cards_to_reveal)

            let revealed_card_count = _.size(player_cards.revealed)
            if (revealed_card_count < cards_to_reveal && _.size(player_cards.discard) > 0) {
                DeckShuffler.shuffle(game, player_cards)
                player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, cards_to_reveal - revealed_card_count))
                player_cards.deck = _.drop(player_cards.deck, cards_to_reveal - revealed_card_count)
            }

            let are_all_actions = (_.size(player_cards.revealed) === cards_to_reveal) && _.every(player_cards.revealed, function (revealed_card) {
                return _.includes(_.words(revealed_card.types), 'action')
            });

            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose a card to put in hand:',
                cards: player_cards.revealed,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, are_all_actions)
            turn_event_processor.process(BorderGuard.put_in_hand)
        }
    }

    static put_in_hand(game, player_cards, selected_cards, are_all_actions) {
        console.log({ are_all_actions })
        let selected_card = selected_cards[0]
        let selected_card_index = _.findIndex(player_cards.revealed, function(card) {
            return card.name === selected_card.name
        })

        console.log(selected_card_index);
        player_cards.revealed.splice(selected_card_index, 1)

        // console.log({discarded_card})
        player_cards.hand.push(selected_card)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(selected_card)} in their hand`)

        let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.map(player_cards.revealed, 'name'))
        card_discarder.discard()

        if (are_all_actions) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_options',
                instructions: `Choose One:`,
                minimum: 1,
                maximum: 1,
                options: [
                    { text: 'Take the Horn', value: 'horn' },
                    { text: 'Take the Lantern', value: 'lantern' }
                ]
            })

            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(BorderGuard.process_response)
        }
    }

    static process_response(game, player_cards, response) {
        response = response[0]
        if (response === 'horn') {
            BorderGuard.get_artifact(game, player_cards, new Horn(), 'Horn')
        } else if (response === 'lantern') {
            BorderGuard.get_artifact(game, player_cards, new Lantern(), 'Lantern')
        }
    }

    static get_artifact(game, player_cards, artifact_instance, artifact_name) {
        let artifact_index = _.findIndex(player_cards.artifacts, function (artifact) {
            return artifact.name === artifact_name
        })

        if (artifact_index === -1) {
            let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
            ordered_player_cards.shift()

            _.each(ordered_player_cards, function (other_player_cards) {
                let other_player_artifact_index = _.findIndex(other_player_cards.artifacts, function (artifact) {
                    return artifact.name === artifact_name
                })
                if (other_player_artifact_index !== -1) {
                    other_player_cards.artifacts.splice(other_player_artifact_index, 1)
                }
                PlayerCardsModel.update(game._id, other_player_cards)
            })

            let artifact = artifact_instance.to_h()
            player_cards.artifacts.push(artifact)
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(artifact, true)}`)
        }
    }
}
