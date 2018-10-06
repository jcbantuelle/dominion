Swashbuckler = class Swashbuckler extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 5
    }

    artifact_name() {
        return 'Treasure Chest'
    }

    get_artifact_instance() {
        return new TreasureChest()
    }

    play(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        let drawn_count = card_drawer.draw(3)

        if (_.size(player_cards.discard) > 0) {
            player_cards.coin_tokens += 1
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes a coin token`)

            if (player_cards.coin_tokens > 3) {
                this.get_artifact(game, player_cards)
            }
        } else {
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong>'s discard pile is empty`)
        }
    }

    get_artifact(game, player_cards) {
        let self = this;

        let artifact_index = _.findIndex(player_cards.artifacts, function (artifact) {
            return artifact.name === self.artifact_name()
        })

        if (artifact_index === -1) {
            let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
            ordered_player_cards.shift()

            _.each(ordered_player_cards, function (other_player_cards) {
                let other_player_artifact_index = _.findIndex(other_player_cards.artifacts, function (artifact) {
                    return artifact.name === self.artifact_name()
                })
                if (other_player_artifact_index !== -1) {
                    other_player_cards.artifacts.splice(other_player_artifact_index, 1)
                }
                PlayerCardsModel.update(game._id, other_player_cards)
            })

            let artifact = (this.get_artifact_instance()).to_h()
            player_cards.artifacts.push(artifact)
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(artifact, true)}`)
        }
    }


}
