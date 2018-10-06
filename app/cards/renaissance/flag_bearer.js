FlagBearer = class FlagBearer extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 4
    }

    artifact_name() {
        return 'Flag'
    }

    get_artifact_instance() {
        return new Flag()
    }

    play(game, player_cards) {
        let gained_coins = CoinGainer.gain(game, player_cards, 2)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
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

    gain_or_trash_event(player) {
        this.get_artifact(player.game, player.player_cards)
    }

    gain_event(buyer) {
        this.gain_or_trash_event(buyer)
    }

    trash_event(trasher) {
        this.gain_or_trash_event(trasher)
    }
}
